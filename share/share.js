define(function(require, module, exports) {
    main.consumes = [
        "Plugin", "c9", "commands", "menus", "ui", "layout", "dialog.alert",
        "MembersPanel", "api", "info"
    ];
    main.provides = ["dialog.share"];
    return main;

    function main(options, imports, register) {
        var Plugin       = imports.Plugin;
        var c9           = imports.c9;
        var MembersPanel = imports.MembersPanel;
        var commands     = imports.commands;
        var menus        = imports.menus;
        var ui           = imports.ui;
        var alert        = imports["dialog.alert"].show;
        var layout       = imports.layout;
        var api          = imports.api;

        var markup   = require("text!./share.xml");
        var css      = require("text!./share.css");

        var plugin   = new Plugin("Ajax.org", main.consumes);
        var emit     = plugin.getEmitter();

        var dialog, btnInvite, btnDone, txtUsername, shareLink, membersParent, accessButton;

        var loaded = false;
        function load() {
            if (loaded) return;
            loaded = true;

            if (!c9.isAdmin)
                return;

            commands.addCommand({
                name    : "sharedialog",
                hint    : "Share the workspace",
                group   : "General",
                exec    : show
            }, plugin);

            menus.addItemByPath("Window/Share Workspace", new ui.item({
                command: "sharedialog"
            }), 20100, plugin);

            var btn =  new ui.button({
                "skin"    : "btn-default-css3",
                "class"   : "btn-green",
                "caption" : "Share",
                "tooltip" : "Share Workspace",
                "width"   : 80,
                "command" : "sharedialog"
            });

            ui.insertByIndex(layout.findParent({
                name: "preferences"
            }), btn, 800, plugin);
        }

        var drawn = false;
        function draw(){
            if (drawn) return;
            drawn = true;

            ui.insertCss(css, plugin);
            ui.insertMarkup(null, markup, plugin);

            dialog          = plugin.getElement("window");
            btnInvite       = plugin.getElement("btnInvite");
            btnDone         = plugin.getElement("btnDone");
            txtUsername     = plugin.getElement("txtUsername");
            shareLink       = plugin.getElement("shareLink").$int;
            membersParent   = plugin.getElement("members");
            accessButton    = plugin.getElement("access").$int;

            accessButton.addEventListener("click", function () {
                var className = accessButton.classList;
                var actionArr = className.contains("rw") ? ["rw", "r"] : ["r", "rw"];
                className.remove(actionArr[0]);
                className.add(actionArr[1]);
            });

            btnDone.addEventListener("click", hide);
            btnInvite.addEventListener("click", inviteUser);

            txtUsername.on("keydown", function(e){
                if (e.keyCode == 13) {
                    inviteUser();
                    e.returnValue = false;
                    return false;
                }
                else if (e.keyCode === 27) {
                    hide();
                }
            });

            var membersPanel = new MembersPanel("Ajax.org", main.consumes, {});
            membersPanel.draw({ aml: membersParent });
            membersPanel.show();

            emit("draw", null, true);
        }

        /***** Methods *****/

        function inviteUser(){
            var username = txtUsername.value;
            var access = accessButton.classList.contains("rw") ? "rw" : "r";
            btnInvite.setAttribute("disabled", true);
            doInvite(username, access, function(err) {
                btnInvite.setAttribute("disabled", false);
                if (err)
                    return alert("Error", "Error adding workspace member", String(err));
                hide();
                txtUsername.setValue("");
                alert("Success", "Workspace Member Added", "`" + username + "` granted `" + access.toUpperCase() + "` to the workspace !");
            });
        }

        function doInvite(username, access, callback) {
            api.collab.post("members/add", {
                body: {
                    username : username,
                    access   : access
                }
            }, function (err, data, res) {
                callback(err);
            });
        }

        function show(){
            draw();
            dialog.show();
            txtUsername.setValue("");
            txtUsername.blur();
            shareLink.focus();
            shareLink.select();
        }

        function hide() {
            dialog && dialog.hide();
        }

        plugin.on("load", function(){
            load();
        });
        
        /***** Register and define API *****/

        /**
         * The Share dialog - allowing users to share the workspace with other cloud9 users
         * @singleton
         */
        plugin.freezePublicAPI({
        });

        register(null, {
            "dialog.share": plugin
        });
    }
});