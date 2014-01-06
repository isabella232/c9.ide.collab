"use strict";
/*global require console module process __dirname*/
var Fs = require("fs");
var Path = require("path");
var net = require("net");
var Stream = require("stream").Stream;
var crypto = require('crypto');
var exists = Fs.exists || Path.exists;

/* diff_match_patch start */

var DIFF_EQUAL = 0;
var DIFF_INSERT = 1;
var DIFF_DELETE = -1;
function diff_match_patch(){this.Diff_Timeout=1;this.Diff_EditCost=4;this.Match_Threshold=0.5;this.Match_Distance=1E3;this.Patch_DeleteThreshold=0.5;this.Patch_Margin=4;this.Match_MaxBits=32}
diff_match_patch.prototype.diff_main=function(a,b,c,d){"undefined"==typeof d&&(d=0>=this.Diff_Timeout?Number.MAX_VALUE:(new Date).getTime()+1E3*this.Diff_Timeout);if(null==a||null==b)throw Error("Null input. (diff_main)");if(a==b)return a?[[0,a]]:[];"undefined"==typeof c&&(c=!0);var e=c,f=this.diff_commonPrefix(a,b),c=a.substring(0,f),a=a.substring(f),b=b.substring(f),f=this.diff_commonSuffix(a,b),g=a.substring(a.length-f),a=a.substring(0,a.length-f),b=b.substring(0,b.length-f),a=this.diff_compute_(a,b,e,d);c&&a.unshift([0,c]);g&&a.push([0,g]);this.diff_cleanupMerge(a);return a};
diff_match_patch.prototype.diff_compute_=function(a,b,c,d){if(!a)return[[1,b]];if(!b)return[[-1,a]];var e=a.length>b.length?a:b,f=a.length>b.length?b:a,g=e.indexOf(f);if(-1!=g)return c=[[1,e.substring(0,g)],[0,f],[1,e.substring(g+f.length)]],a.length>b.length&&(c[0][0]=c[2][0]=-1),c;if(1==f.length)return[[-1,a],[1,b]];return(e=this.diff_halfMatch_(a,b))?(f=e[0],a=e[1],g=e[2],b=e[3],e=e[4],f=this.diff_main(f,g,c,d),c=this.diff_main(a,b,c,d),f.concat([[0,e]],c)):c&&100<a.length&&100<b.length?this.diff_lineMode_(a,b,d):this.diff_bisect_(a,b,d)};
diff_match_patch.prototype.diff_lineMode_=function(a,b,c){var d=this.diff_linesToChars_(a,b),a=d.chars1,b=d.chars2,d=d.lineArray,a=this.diff_main(a,b,!1,c);this.diff_charsToLines_(a,d);this.diff_cleanupSemantic(a);a.push([0,""]);for(var e=d=b=0,f="",g="";b<a.length;){switch(a[b][0]){case 1:e++;g+=a[b][1];break;case -1:d++;f+=a[b][1];break;case 0:if(1<=d&&1<=e){a.splice(b-d-e,d+e);b=b-d-e;d=this.diff_main(f,g,!1,c);for(e=d.length-1;0<=e;e--)a.splice(b,0,d[e]);b+=d.length}d=e=0;g=f=""}b++}a.pop();return a};
diff_match_patch.prototype.diff_bisect_=function(a,b,c){for(var d=a.length,e=b.length,f=Math.ceil((d+e)/2),g=f,h=2*f,j=Array(h),i=Array(h),k=0;k<h;k++)j[k]=-1,i[k]=-1;j[g+1]=0;i[g+1]=0;for(var k=d-e,p=0!=k%2,q=0,s=0,o=0,v=0,u=0;u<f&&!((new Date).getTime()>c);u++){for(var n=-u+q;n<=u-s;n+=2){var l=g+n,m;m=n==-u||n!=u&&j[l-1]<j[l+1]?j[l+1]:j[l-1]+1;for(var r=m-n;m<d&&r<e&&a.charAt(m)==b.charAt(r);)m++,r++;j[l]=m;if(m>d)s+=2;else if(r>e)q+=2;else if(p&&(l=g+k-n,0<=l&&l<h&&-1!=i[l])){var t=d-i[l];if(m>=t)return this.diff_bisectSplit_(a,b,m,r,c)}}for(n=-u+o;n<=u-v;n+=2){l=g+n;t=n==-u||n!=u&&i[l-1]<i[l+1]?i[l+1]:i[l-1]+1;for(m=t-n;t<d&&m<e&&a.charAt(d-t-1)==b.charAt(e-m-1);)t++,m++;i[l]=t;if(t>d)v+=2;else if(m>e)o+=2;else if(!p&&(l=g+k-n,0<=l&&l<h&&-1!=j[l]&&(m=j[l],r=g+m-l,t=d-t,m>=t)))return this.diff_bisectSplit_(a,b,m,r,c)}}return[[-1,a],[1,b]]};
diff_match_patch.prototype.diff_bisectSplit_=function(a,b,c,d,e){var f=a.substring(0,c),g=b.substring(0,d),a=a.substring(c),b=b.substring(d),f=this.diff_main(f,g,!1,e),e=this.diff_main(a,b,!1,e);return f.concat(e)};
diff_match_patch.prototype.diff_linesToChars_=function(a,b){function c(a){for(var b="",c=0,f=-1,g=d.length;f<a.length-1;){f=a.indexOf("\n",c);-1==f&&(f=a.length-1);var q=a.substring(c,f+1),c=f+1;(e.hasOwnProperty?e.hasOwnProperty(q):void 0!==e[q])?b+=String.fromCharCode(e[q]):(b+=String.fromCharCode(g),e[q]=g,d[g++]=q)}return b}var d=[],e={};d[0]="";var f=c(a),g=c(b);return{chars1:f,chars2:g,lineArray:d}};
diff_match_patch.prototype.diff_charsToLines_=function(a,b){for(var c=0;c<a.length;c++){for(var d=a[c][1],e=[],f=0;f<d.length;f++)e[f]=b[d.charCodeAt(f)];a[c][1]=e.join("")}};diff_match_patch.prototype.diff_commonPrefix=function(a,b){if(!a||!b||a.charAt(0)!=b.charAt(0))return 0;for(var c=0,d=Math.min(a.length,b.length),e=d,f=0;c<e;)a.substring(f,e)==b.substring(f,e)?f=c=e:d=e,e=Math.floor((d-c)/2+c);return e};
diff_match_patch.prototype.diff_commonSuffix=function(a,b){if(!a||!b||a.charAt(a.length-1)!=b.charAt(b.length-1))return 0;for(var c=0,d=Math.min(a.length,b.length),e=d,f=0;c<e;)a.substring(a.length-e,a.length-f)==b.substring(b.length-e,b.length-f)?f=c=e:d=e,e=Math.floor((d-c)/2+c);return e};
diff_match_patch.prototype.diff_commonOverlap_=function(a,b){var c=a.length,d=b.length;if(0==c||0==d)return 0;c>d?a=a.substring(c-d):c<d&&(b=b.substring(0,c));c=Math.min(c,d);if(a==b)return c;for(var d=0,e=1;;){var f=a.substring(c-e),f=b.indexOf(f);if(-1==f)return d;e+=f;if(0==f||a.substring(c-e)==b.substring(0,e))d=e,e++}};
diff_match_patch.prototype.diff_halfMatch_=function(a,b){function c(a,b,c){for(var d=a.substring(c,c+Math.floor(a.length/4)),e=-1,g="",h,j,n,l;-1!=(e=b.indexOf(d,e+1));){var m=f.diff_commonPrefix(a.substring(c),b.substring(e)),r=f.diff_commonSuffix(a.substring(0,c),b.substring(0,e));g.length<r+m&&(g=b.substring(e-r,e)+b.substring(e,e+m),h=a.substring(0,c-r),j=a.substring(c+m),n=b.substring(0,e-r),l=b.substring(e+m))}return 2*g.length>=a.length?[h,j,n,l,g]:null}if(0>=this.Diff_Timeout)return null;var d=a.length>b.length?a:b,e=a.length>b.length?b:a;if(4>d.length||2*e.length<d.length)return null;var f=this,g=c(d,e,Math.ceil(d.length/4)),d=c(d,e,Math.ceil(d.length/2)),h;if(!g&&!d)return null;h=d?g?g[4].length>d[4].length?g:d:d:g;var j;a.length>b.length?(g=h[0],d=h[1],e=h[2],j=h[3]):(e=h[0],j=h[1],g=h[2],d=h[3]);h=h[4];return[g,d,e,j,h]};
diff_match_patch.prototype.diff_cleanupSemantic=function(a){for(var b=!1,c=[],d=0,e=null,f=0,g=0,h=0,j=0,i=0;f<a.length;)0==a[f][0]?(c[d++]=f,g=j,h=i,i=j=0,e=a[f][1]):(1==a[f][0]?j+=a[f][1].length:i+=a[f][1].length,e&&e.length<=Math.max(g,h)&&e.length<=Math.max(j,i)&&(a.splice(c[d-1],0,[-1,e]),a[c[d-1]+1][0]=1,d--,d--,f=0<d?c[d-1]:-1,i=j=h=g=0,e=null,b=!0)),f++;b&&this.diff_cleanupMerge(a);this.diff_cleanupSemanticLossless(a);for(f=1;f<a.length;){if(-1==a[f-1][0]&&1==a[f][0]){b=a[f-1][1];c=a[f][1];d=this.diff_commonOverlap_(b,c);e=this.diff_commonOverlap_(c,b);if(d>=e){if(d>=b.length/2||d>=c.length/2)a.splice(f,0,[0,c.substring(0,d)]),a[f-1][1]=b.substring(0,b.length-d),a[f+1][1]=c.substring(d),f++}else if(e>=b.length/2||e>=c.length/2)a.splice(f,0,[0,b.substring(0,e)]),a[f-1][0]=1,a[f-1][1]=c.substring(0,c.length-e),a[f+1][0]=-1,a[f+1][1]=b.substring(e),f++;f++}f++}};
diff_match_patch.prototype.diff_cleanupSemanticLossless=function(a){function b(a,b){if(!a||!b)return 6;var c=a.charAt(a.length-1),d=b.charAt(0),e=c.match(diff_match_patch.nonAlphaNumericRegex_),f=d.match(diff_match_patch.nonAlphaNumericRegex_),g=e&&c.match(diff_match_patch.whitespaceRegex_),h=f&&d.match(diff_match_patch.whitespaceRegex_),c=g&&c.match(diff_match_patch.linebreakRegex_),d=h&&d.match(diff_match_patch.linebreakRegex_),i=c&&a.match(diff_match_patch.blanklineEndRegex_),j=d&&b.match(diff_match_patch.blanklineStartRegex_);return i||j?5:c||d?4:e&&!g&&h?3:g||h?2:e||f?1:0}for(var c=1;c<a.length-1;){if(0==a[c-1][0]&&0==a[c+1][0]){var d=a[c-1][1],e=a[c][1],f=a[c+1][1],g=this.diff_commonSuffix(d,e);if(g)var h=e.substring(e.length-g),d=d.substring(0,d.length-g),e=h+e.substring(0,e.length-g),f=h+f;for(var g=d,h=e,j=f,i=b(d,e)+b(e,f);e.charAt(0)===f.charAt(0);){var d=d+e.charAt(0),e=e.substring(1)+f.charAt(0),f=f.substring(1),k=b(d,e)+b(e,f);k>=i&&(i=k,g=d,h=e,j=f)}a[c-1][1]!=g&&(g?a[c-1][1]=g:(a.splice(c-1,1),c--),a[c][1]=h,j?a[c+1][1]=j:(a.splice(c+1,1),c--))}c++}};diff_match_patch.nonAlphaNumericRegex_=/[^a-zA-Z0-9]/;diff_match_patch.whitespaceRegex_=/\s/;diff_match_patch.linebreakRegex_=/[\r\n]/;diff_match_patch.blanklineEndRegex_=/\n\r?\n$/;diff_match_patch.blanklineStartRegex_=/^\r?\n\r?\n/;
diff_match_patch.prototype.diff_cleanupEfficiency=function(a){for(var b=!1,c=[],d=0,e=null,f=0,g=!1,h=!1,j=!1,i=!1;f<a.length;){if(0==a[f][0])a[f][1].length<this.Diff_EditCost&&(j||i)?(c[d++]=f,g=j,h=i,e=a[f][1]):(d=0,e=null),j=i=!1;else if(-1==a[f][0]?i=!0:j=!0,e&&(g&&h&&j&&i||e.length<this.Diff_EditCost/2&&3==g+h+j+i))a.splice(c[d-1],0,[-1,e]),a[c[d-1]+1][0]=1,d--,e=null,g&&h?(j=i=!0,d=0):(d--,f=0<d?c[d-1]:-1,j=i=!1),b=!0;f++}b&&this.diff_cleanupMerge(a)};
diff_match_patch.prototype.diff_cleanupMerge=function(a){a.push([0,""]);for(var b=0,c=0,d=0,e="",f="",g;b<a.length;)switch(a[b][0]){case 1:d++;f+=a[b][1];b++;break;case -1:c++;e+=a[b][1];b++;break;case 0:1<c+d?(0!==c&&0!==d&&(g=this.diff_commonPrefix(f,e),0!==g&&(0<b-c-d&&0==a[b-c-d-1][0]?a[b-c-d-1][1]+=f.substring(0,g):(a.splice(0,0,[0,f.substring(0,g)]),b++),f=f.substring(g),e=e.substring(g)),g=this.diff_commonSuffix(f,e),0!==g&&(a[b][1]=f.substring(f.length-g)+a[b][1],f=f.substring(0,f.length-g),e=e.substring(0,e.length-g))),0===c?a.splice(b-d,c+d,[1,f]):0===d?a.splice(b-c,c+d,[-1,e]):a.splice(b-c-d,c+d,[-1,e],[1,f]),b=b-c-d+(c?1:0)+(d?1:0)+1):0!==b&&0==a[b-1][0]?(a[b-1][1]+=a[b][1],a.splice(b,1)):b++,c=d=0,f=e=""}""===a[a.length-1][1]&&a.pop();c=!1;for(b=1;b<a.length-1;)0==a[b-1][0]&&0==a[b+1][0]&&(a[b][1].substring(a[b][1].length-a[b-1][1].length)==a[b-1][1]?(a[b][1]=a[b-1][1]+a[b][1].substring(0,a[b][1].length-a[b-1][1].length),a[b+1][1]=a[b-1][1]+a[b+1][1],a.splice(b-1,1),c=!0):a[b][1].substring(0,a[b+1][1].length)==a[b+1][1]&&(a[b-1][1]+=a[b+1][1],a[b][1]=a[b][1].substring(a[b+1][1].length)+a[b+1][1],a.splice(b+1,1),c=!0)),b++;c&&this.diff_cleanupMerge(a)};
diff_match_patch.prototype.diff_xIndex=function(a,b){var c=0,d=0,e=0,f=0,g;for(g=0;g<a.length;g++){1!==a[g][0]&&(c+=a[g][1].length);-1!==a[g][0]&&(d+=a[g][1].length);if(c>b)break;e=c;f=d}return a.length!=g&&-1===a[g][0]?f:f+(b-e)};
diff_match_patch.prototype.diff_prettyHtml=function(a){for(var b=[],c=/&/g,d=/</g,e=/>/g,f=/\n/g,g=0;g<a.length;g++){var h=a[g][0],j=a[g][1],j=j.replace(c,"&amp;").replace(d,"&lt;").replace(e,"&gt;").replace(f,"&para;<br>");switch(h){case 1:b[g]='<ins style="background:#e6ffe6;">'+j+"</ins>";break;case -1:b[g]='<del style="background:#ffe6e6;">'+j+"</del>";break;case 0:b[g]="<span>"+j+"</span>"}}return b.join("")};
diff_match_patch.prototype.diff_text1=function(a){for(var b=[],c=0;c<a.length;c++)1!==a[c][0]&&(b[c]=a[c][1]);return b.join("")};
diff_match_patch.prototype.diff_text2=function(a){for(var b=[],c=0;c<a.length;c++)-1!==a[c][0]&&(b[c]=a[c][1]);return b.join("")};
diff_match_patch.prototype.diff_levenshtein=function(a){for(var b=0,c=0,d=0,e=0;e<a.length;e++){var f=a[e][0],g=a[e][1];switch(f){case 1:c+=g.length;break;case -1:d+=g.length;break;case 0:b+=Math.max(c,d),d=c=0}}return b+=Math.max(c,d)};
diff_match_patch.prototype.diff_toDelta=function(a){for(var b=[],c=0;c<a.length;c++)switch(a[c][0]){case 1:b[c]="+"+encodeURI(a[c][1]);break;case -1:b[c]="-"+a[c][1].length;break;case 0:b[c]="="+a[c][1].length}return b.join("\t").replace(/%20/g," ")};
diff_match_patch.prototype.diff_fromDelta=function(a,b){for(var c=[],d=0,e=0,f=b.split(/\t/g),g=0;g<f.length;g++){var h=f[g].substring(1);switch(f[g].charAt(0)){case "+":try{c[d++]=[1,decodeURI(h)]}catch(j){throw Error("Illegal escape in diff_fromDelta: "+h);}break;case "-":case "=":var i=parseInt(h,10);if(isNaN(i)||0>i)throw Error("Invalid number in diff_fromDelta: "+h);h=a.substring(e,e+=i);"="==f[g].charAt(0)?c[d++]=[0,h]:c[d++]=[-1,h];break;default:if(f[g])throw Error("Invalid diff operation in diff_fromDelta: "+f[g]);}}if(e!=a.length)throw Error("Delta length ("+e+") does not equal source text length ("+a.length+").");return c};
diff_match_patch.prototype.match_main=function(a,b,c){if(null==a||null==b||null==c)throw Error("Null input. (match_main)");c=Math.max(0,Math.min(c,a.length));return a==b?0:a.length?a.substring(c,c+b.length)==b?c:this.match_bitap_(a,b,c):-1};
diff_match_patch.prototype.match_bitap_=function(a,b,c){function d(a,d){var e=a/b.length,g=Math.abs(c-d);return!f.Match_Distance?g?1:e:e+g/f.Match_Distance}if(b.length>this.Match_MaxBits)throw Error("Pattern too long for this browser.");var e=this.match_alphabet_(b),f=this,g=this.Match_Threshold,h=a.indexOf(b,c);-1!=h&&(g=Math.min(d(0,h),g),h=a.lastIndexOf(b,c+b.length),-1!=h&&(g=Math.min(d(0,h),g)));for(var j=1<<b.length-1,h=-1,i,k,p=b.length+a.length,q,s=0;s<b.length;s++){i=0;for(k=p;i<k;)d(s,c+k)<=g?i=k:p=k,k=Math.floor((p-i)/2+i);p=k;i=Math.max(1,c-k+1);var o=Math.min(c+k,a.length)+b.length;k=Array(o+2);for(k[o+1]=(1<<s)-1;o>=i;o--){var v=e[a.charAt(o-1)];k[o]=0===s?(k[o+1]<<1|1)&v:(k[o+1]<<1|1)&v|(q[o+1]|q[o])<<1|1|q[o+1];if(k[o]&j&&(v=d(s,o-1),v<=g))if(g=v,h=o-1,h>c)i=Math.max(1,2*c-h);else break}if(d(s+1,c)>g)break;q=k}return h};
diff_match_patch.prototype.match_alphabet_=function(a){for(var b={},c=0;c<a.length;c++)b[a.charAt(c)]=0;for(c=0;c<a.length;c++)b[a.charAt(c)]|=1<<a.length-c-1;return b};
diff_match_patch.prototype.patch_addContext_=function(a,b){if(0!=b.length){for(var c=b.substring(a.start2,a.start2+a.length1),d=0;b.indexOf(c)!=b.lastIndexOf(c)&&c.length<this.Match_MaxBits-this.Patch_Margin-this.Patch_Margin;)d+=this.Patch_Margin,c=b.substring(a.start2-d,a.start2+a.length1+d);d+=this.Patch_Margin;(c=b.substring(a.start2-d,a.start2))&&a.diffs.unshift([0,c]);(d=b.substring(a.start2+a.length1,a.start2+a.length1+d))&&a.diffs.push([0,d]);a.start1-=c.length;a.start2-=c.length;a.length1+=c.length+d.length;a.length2+=c.length+d.length}};
diff_match_patch.prototype.patch_make=function(a,b,c){var d;if("string"==typeof a&&"string"==typeof b&&"undefined"==typeof c)d=a,b=this.diff_main(d,b,!0),2<b.length&&(this.diff_cleanupSemantic(b),this.diff_cleanupEfficiency(b));else if(a&&"object"==typeof a&&"undefined"==typeof b&&"undefined"==typeof c)b=a,d=this.diff_text1(b);else if("string"==typeof a&&b&&"object"==typeof b&&"undefined"==typeof c)d=a;else if("string"==typeof a&&"string"==typeof b&&c&&"object"==typeof c)d=a,b=c;else throw Error("Unknown call format to patch_make.");if(0===b.length)return[];for(var c=[],a=new diff_match_patch.patch_obj,e=0,f=0,g=0,h=d,j=0;j<b.length;j++){var i=b[j][0],k=b[j][1];if(!e&&0!==i)a.start1=f,a.start2=g;switch(i){case 1:a.diffs[e++]=b[j];a.length2+=k.length;d=d.substring(0,g)+k+d.substring(g);break;case -1:a.length1+=k.length;a.diffs[e++]=b[j];d=d.substring(0,g)+d.substring(g+k.length);break;case 0:k.length<=2*this.Patch_Margin&&e&&b.length!=j+1?(a.diffs[e++]=b[j],a.length1+=k.length,a.length2+=k.length):k.length>=2*this.Patch_Margin&&e&&(this.patch_addContext_(a,h),c.push(a),a=new diff_match_patch.patch_obj,e=0,h=d,f=g)}1!==i&&(f+=k.length);-1!==i&&(g+=k.length)}e&&(this.patch_addContext_(a,h),c.push(a));return c};
diff_match_patch.prototype.patch_deepCopy=function(a){for(var b=[],c=0;c<a.length;c++){var d=a[c],e=new diff_match_patch.patch_obj;e.diffs=[];for(var f=0;f<d.diffs.length;f++)e.diffs[f]=d.diffs[f].slice();e.start1=d.start1;e.start2=d.start2;e.length1=d.length1;e.length2=d.length2;b[c]=e}return b};
diff_match_patch.prototype.patch_apply=function(a,b){if(0==a.length)return[b,[]];var a=this.patch_deepCopy(a),c=this.patch_addPadding(a),b=c+b+c;this.patch_splitMax(a);for(var d=0,e=[],f=0;f<a.length;f++){var g=a[f].start2+d,h=this.diff_text1(a[f].diffs),j,i=-1;if(h.length>this.Match_MaxBits){if(j=this.match_main(b,h.substring(0,this.Match_MaxBits),g),-1!=j&&(i=this.match_main(b,h.substring(h.length-this.Match_MaxBits),g+h.length-this.Match_MaxBits),-1==i||j>=i))j=-1}else j=this.match_main(b,h,g);if(-1==j)e[f]=!1,d-=a[f].length2-a[f].length1;else if(e[f]=!0,d=j-g,g=-1==i?b.substring(j,j+h.length):b.substring(j,i+this.Match_MaxBits),h==g)b=b.substring(0,j)+this.diff_text2(a[f].diffs)+b.substring(j+h.length);else if(g=this.diff_main(h,g,!1),h.length>this.Match_MaxBits&&this.diff_levenshtein(g)/h.length>this.Patch_DeleteThreshold)e[f]=!1;else{this.diff_cleanupSemanticLossless(g);for(var h=0,k,i=0;i<a[f].diffs.length;i++){var p=a[f].diffs[i];0!==p[0]&&(k=this.diff_xIndex(g,h));1===p[0]?b=b.substring(0,j+k)+p[1]+b.substring(j+k):-1===p[0]&&(b=b.substring(0,j+k)+b.substring(j+this.diff_xIndex(g,h+p[1].length)));-1!==p[0]&&(h+=p[1].length)}}}b=b.substring(c.length,b.length-c.length);return[b,e]};
diff_match_patch.prototype.patch_addPadding=function(a){for(var b=this.Patch_Margin,c="",d=1;d<=b;d++)c+=String.fromCharCode(d);for(d=0;d<a.length;d++)a[d].start1+=b,a[d].start2+=b;var d=a[0],e=d.diffs;if(0==e.length||0!=e[0][0])e.unshift([0,c]),d.start1-=b,d.start2-=b,d.length1+=b,d.length2+=b;else if(b>e[0][1].length){var f=b-e[0][1].length;e[0][1]=c.substring(e[0][1].length)+e[0][1];d.start1-=f;d.start2-=f;d.length1+=f;d.length2+=f}d=a[a.length-1];e=d.diffs;0==e.length||0!=e[e.length-1][0]?(e.push([0,c]),d.length1+=b,d.length2+=b):b>e[e.length-1][1].length&&(f=b-e[e.length-1][1].length,e[e.length-1][1]+=c.substring(0,f),d.length1+=f,d.length2+=f);return c};
diff_match_patch.prototype.patch_splitMax=function(a){for(var b=this.Match_MaxBits,c=0;c<a.length;c++)if(!(a[c].length1<=b)){var d=a[c];a.splice(c--,1);for(var e=d.start1,f=d.start2,g="";0!==d.diffs.length;){var h=new diff_match_patch.patch_obj,j=!0;h.start1=e-g.length;h.start2=f-g.length;if(""!==g)h.length1=h.length2=g.length,h.diffs.push([0,g]);for(;0!==d.diffs.length&&h.length1<b-this.Patch_Margin;){var g=d.diffs[0][0],i=d.diffs[0][1];1===g?(h.length2+=i.length,f+=i.length,h.diffs.push(d.diffs.shift()),j=!1):-1===g&&1==h.diffs.length&&0==h.diffs[0][0]&&i.length>2*b?(h.length1+=i.length,e+=i.length,j=!1,h.diffs.push([g,i]),d.diffs.shift()):(i=i.substring(0,b-h.length1-this.Patch_Margin),h.length1+=i.length,e+=i.length,0===g?(h.length2+=i.length,f+=i.length):j=!1,h.diffs.push([g,i]),i==d.diffs[0][1]?d.diffs.shift():d.diffs[0][1]=d.diffs[0][1].substring(i.length))}g=this.diff_text2(h.diffs);g=g.substring(g.length-this.Patch_Margin);i=this.diff_text1(d.diffs).substring(0,this.Patch_Margin);""!==i&&(h.length1+=i.length,h.length2+=i.length,0!==h.diffs.length&&0===h.diffs[h.diffs.length-1][0]?h.diffs[h.diffs.length-1][1]+=i:h.diffs.push([0,i]));j||a.splice(++c,0,h)}}};
diff_match_patch.prototype.patch_toText=function(a){for(var b=[],c=0;c<a.length;c++)b[c]=a[c];return b.join("")};
diff_match_patch.prototype.patch_fromText=function(a){var b=[];if(!a)return b;for(var a=a.split("\n"),c=0,d=/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;c<a.length;){var e=a[c].match(d);if(!e)throw Error("Invalid patch string: "+a[c]);var f=new diff_match_patch.patch_obj;b.push(f);f.start1=parseInt(e[1],10);""===e[2]?(f.start1--,f.length1=1):"0"==e[2]?f.length1=0:(f.start1--,f.length1=parseInt(e[2],10));f.start2=parseInt(e[3],10);""===e[4]?(f.start2--,f.length2=1):"0"==e[4]?f.length2=0:(f.start2--,f.length2=parseInt(e[4],10));for(c++;c<a.length;){e=a[c].charAt(0);try{var g=decodeURI(a[c].substring(1))}catch(h){throw Error("Illegal escape in patch_fromText: "+g);}if("-"==e)f.diffs.push([-1,g]);else if("+"==e)f.diffs.push([1,g]);else if(" "==e)f.diffs.push([0,g]);else if("@"==e)break;else if(""!==e)throw Error('Invalid patch mode "'+e+'" in: '+g);c++}}return b};
diff_match_patch.patch_obj=function(){this.diffs=[];this.start2=this.start1=null;this.length2=this.length1=0};
diff_match_patch.patch_obj.prototype.toString=function(){var a,b;a=0===this.length1?this.start1+",0":1==this.length1?this.start1+1:this.start1+1+","+this.length1;b=0===this.length2?this.start2+",0":1==this.length2?this.start2+1:this.start2+1+","+this.length2;a=["@@ -"+a+" +"+b+" @@\n"];var c;for(b=0;b<this.diffs.length;b++){switch(this.diffs[b][0]){case 1:c="+";break;case -1:c="-";break;case 0:c=" "}a[b+1]=c+encodeURI(this.diffs[b][1])+"\n"}return a.join("").replace(/%20/g," ")};
/* diff_match_patch end */

function NOOP () {}

// Wrap Sequelize callback-style to NodeJS"s standard callback-style
function wrapSeq(fun, next) {
    return fun.success(function () {
        next.apply(null, [null].concat(Array.prototype.slice.apply(arguments)));
    }).error(next);
}

function hashString(str) {
    return crypto.createHash('md5').update(str).digest("hex");
}

// Copied from async
// Can be generically used in many scenarios
var async = function() {

    function forEachSeries (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback(null);
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    }

    function series(arr, callback) {
        forEachSeries(arr, function (fn, next) {
            fn.call(null, function (err) {
                if (err)
                    return callback(err);
                next();
            });
        }, callback);
    }

    return {
        series: series,
        forEachSeries: forEachSeries
    };

}();

// Models
var User, Document, Revision, Workspace, ChatMessage;
var basePath;
var PID;
var dbFilePath;
// Cache the workspace state got from the database
var cachedWS;
var cachedUsers;

function getDocPath (path) {
    if (path.indexOf(basePath) === 0)
        return path.substring(basePath.length+1);
    return path;
}

function getAbsolutePath (docId) {
    return Path.join(basePath, docId);
}

function getProjectWD() {
    return Path.join(process.env.OPENSHIFT_DATA_DIR || process.env.HOME, ".c9", PID + "");
}

function installServer(callback) {

    function checkInstalled() {
        try {
            require("sqlite3");
            require("sequelize");
            return true;
        } catch(err) {
            return false;
        }
    }

    dbFilePath = Path.join(getProjectWD(), "collab.db");

    if (!checkInstalled())
        return callback("[vfs-collab] Missing one or more of the required modules ! - NODE_PATH: " + process.env.NODE_PATH + " & Node V: " + process.version);
    callback();
}

function initDB(callback) {

    var Sequelize = require("sequelize");

    var sequelize = new Sequelize("c9-collab", "c9", "c9-collab-secret", {
        // the sql dialect of the database
        dialect: "sqlite",
        omitNull: true,
        storage: dbFilePath,
        logging: false,

        define: {
            // don"t use camelcase for automatically added attributes but underscore style
            // so updatedAt will be updated_at
            underscored: true,
            freezeTableName: false,
            charset: "utf8",
            collate: "utf8_general_ci",
            classMethods: {},
            instanceMethods: {}
        },

        // sync after each association (see below). If set to false, you need to sync manually after setting all associations. Default: true
        syncOnAssociation: true,

        // use pooling in order to reduce db connection overload and to increase speed
        // currently only for mysql and postgresql (since v1.5.0)
        pool: { maxConnections: 5, maxIdleTime: 30}
    });

    Store.User = User = sequelize.define("User", {
        uid            : { type: Sequelize.STRING, primaryKey: true },
        fullname       : { type: Sequelize.STRING },
        email          : { type: Sequelize.STRING }
    }, {
        timestamps: true, paranoid: true
    });

    Store.Workspace = Workspace = sequelize.define("Workspace", {
        authorPool     : { type: Sequelize.TEXT }, // Stringified JSON  - uid -> 1,2, ...etc.
        colorPool      : { type: Sequelize.TEXT }, // Stringified JSON - uid --> "{r: 256, g: 0, b: 0}"
        basePath       : { type: Sequelize.STRING, allowNull: false }
    }, {
        timestamps: true, paranoid: true
    });

    Store.Document = Document = sequelize.define("Document", {
        id             : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        path           : { type: Sequelize.STRING, unique: true },
        contents       : { type: Sequelize.TEXT },
        fsHash         : { type: Sequelize.STRING },
        authAttribs    : { type: Sequelize.TEXT }, // Stringified JSON
        starRevNums    : { type: Sequelize.TEXT }, // Stringified JSON list of integers
        revNum         : { type: Sequelize.INTEGER, defaultValue: 0 },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    }, {
        timestamps: false
    });

    Store.Revision = Revision = sequelize.define("Revision", {
        id        : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        operation : { type: Sequelize.TEXT }, // Stringified JSON Array - can be empty for rev:0
        author    : { type: Sequelize.STRING }, // userId if exists, 0 in syncing operations, -1 in undo non authored text
        revNum    : { type: Sequelize.INTEGER },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    }, {
        timestamps: false
    });

    Store.ChatMessage = ChatMessage = sequelize.define("ChatMessage", {
        id        : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        text      : { type: Sequelize.STRING },
        userId    : { type: Sequelize.STRING, allowNull: false },
        timestamp : { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    }, {
        timestamps: true
    });

    Document.hasMany(Revision);
    Revision.belongsTo(Document);

    async.series([
        function (next) {
            async.forEachSeries([
                // http://www.sqlite.org/pragma.html#pragma_synchronous
                sequelize.query("PRAGMA synchronous = 0;"),
                // Document.drop(), // Cleanup on init
                // Revision.drop(), // Cleanup on init
                User.sync(),
                Workspace.sync(),
                Document.sync(),
                Revision.sync(),
                ChatMessage.sync()
            ], wrapSeq, next);
        },
        function (next) {
            wrapSeq(Workspace.findOrCreate({id: 1}, {
                authorPool: "{}",
                colorPool: "{}",
                basePath: basePath
            }), function(err, ws) {
                if (err)
                    return next(err);
                ws.authorPool = JSON.parse(ws.authorPool);
                ws.colorPool = JSON.parse(ws.colorPool);
                cachedWS = ws;
                next();
            });
        },
        function (next) {
            // ignore error of existing indexe
            wrapSeq(sequelize.query("CREATE INDEX DocumentRevisionsIndex ON Revisions(document_id)"), next.bind(null, null));
        },
        function (next) {
            // ignore error of existing indexe
            wrapSeq(sequelize.query("CREATE INDEX ChatMessageTimestampIndex ON ChatMessages(timestamp)"), next.bind(null, null));
        }
    ], callback);
}

/**************** operations.js ******************/
var operations = (function() {

    // Simple edit constructors.

    function insert(chars) {
        return "i" + chars;
    }

    function del(chars) {
        return "d" + chars;
    }

    function retain(n) {
        return "r" + String(n);
    }

    function type(edit) {
        switch (edit.charAt(0)) {
        case "r":
            return "retain";
        case "d":
            return "delete";
        case "i":
            return "insert";
        default:
            throw new TypeError("Unknown type of edit: " + edit);
        }
    }

    function val(edit) {
        return type(edit) === "retain" ? Number(edit.slice(1)) : edit.slice(1);
    }

    function length(edit) {
        return type(edit) === "retain" ? Number(edit.slice(1)) : edit.length - 1;
    }

    function split(edit, num) {
        if (type(edit) === "retain") {
            var rCount = Number(edit.slice(1));
            return [
                "r" + num,
                "r" + (rCount - num)
            ];
        }
        else {
            return [
                edit[0] + edit.substring(1, num + 1),
                edit[0] + edit.substring(num + 1)
            ];
        }
    }

    function pack(edits) {
        var packed = edits.slice();
        var i = 0;
        while (i < packed.length - 1) {
            if (packed[i][0] === packed[i+1][0])
                packed.splice(i, 2, packed[i][0] + (val(packed[i]) + val(packed[i+1])));
            else
                i++;
        }
        return packed;
    }

    function operation(s, t) {
        var dmp = new diff_match_patch();
        var diffs = dmp.diff_main(s, t);
        dmp.diff_cleanupSemantic(diffs);
        var d, type, val;
        var edits = [];
        for (var i = 0; i < diffs.length; i++) {
            d = diffs[i];
            type = d[0];
            val = d[1];
            switch(type) {
                case DIFF_EQUAL:
                    edits.push("r" + val.length);
                break;
                case DIFF_INSERT:
                    edits.push("i" + val);
                break;
                case DIFF_DELETE:
                    edits.push("d" + val);
                break;
            }
        }
        return edits;
    }

    return {

        operation: operation,
        insert: insert,
        del: del,
        retain: retain,
        type: type,
        val: val,
        length: length,
        split: split,
        pack: pack,

        isDelete: function (edit) {
            return type(edit) === "delete";
        },

        isRetain: function (edit) {
            return type(edit) === "retain";
        },

        isInsert: function (edit) {
            return type(edit) === "insert";
        },

        inverse: function (edits) {
            var edit, t, v, inversed = new Array(edits.length);
            for (var i = 0, el = edits.length; i < el; i++) {
                edit = edits[i];
                t = type(edit);
                v = val(edit);
                switch (t) {
                    case "retain":
                        inversed[i] = edits[i];
                        break;
                    case "insert":
                        inversed[i] = del(v);
                        break;
                    case "delete":
                        inversed[i] = insert(v);
                        break;
                }
            }
            return inversed;
        }
    };
})();

/**************** apply.js ******************/

function applyContents(op, doc) {
    var val, newDoc = "";
    for (var i = 0, len = op.length; i < len; i += 1) {
        val = op[i].slice(1);
        switch (op[i][0]) {
        case "r": // retain
            val = Number(val);
            newDoc += doc.slice(0, val);
            doc = doc.slice(val);
            break;
        case "i": // insert
            newDoc += val;
            break;
        case "d": // delete
            if (doc.indexOf(val) !== 0)
                throw new TypeError("Expected '" + val +
                    "' to delete, found '" + doc.slice(0, 10) + "'");
            else
                doc = doc.slice(val.length);
            break;
        default:
            throw new TypeError("Unknown operation: " + operations.type(op[i]));
        }
    }
    return newDoc;
}


/**************** author_attributes.js ******************/
function AuthorAttributes(minKeySize, maxKeySize) {
    // 2 * x ---> [length, [value]]
    minKeySize = minKeySize || 20; // 4
    maxKeySize = maxKeySize || (5 * minKeySize); // 8

    function addValue(nodes, index, startI, length, id) {
        var i = startI;
        var len = nodes[i];
        var val = nodes[i+1];
        if (index < 0 || index > len)
            throw new Error("Invalid index passed !!");

        if (val === id) {
            nodes[i] += length;
        } else if (index === len) {
            if (nodes[i+3] == id)
                nodes[i+2]+=length;
            else
                nodes.splice(i + 2, 0, length, id);
        } else if (index === 0) {
            if (nodes[i-1] == id)
                nodes[i-2] += length;
            else
                nodes.splice(i , 0, length, id);
        } else {
            nodes.splice(i, 2, index, val, length, id, len - index, val);
        }
    }

    function split(parent, nodes, pos) {
        var splitPos = (nodes.length >> 2) << 1;
        var leftLen = 0, rightLen = 0;
        var right = nodes.splice(splitPos, splitPos + 2);

        for (var i = 0; i < right.length; i += 2)
            rightLen += right[i];

        if (parent) {
            parent.splice(pos + 2, 0, rightLen, right);
            parent[pos] -= rightLen;
        } else {
            var left = nodes.splice(0, splitPos + 2);
            for (var i = 0; i < left.length; i += 2)
                leftLen += left[i];
            nodes.push(leftLen, left, rightLen, right);
        }
    }

    function insert(nodes, index, length, id) {
        if (nodes.length === 0) {
            nodes.push(length, id);
            return;
        }
        var spilled = _insert(nodes, index, length, id);
        if (spilled)
            split(null, nodes, null);
        // sanityCheck(nodes)
    }

    function _insert(nodes, index, length, id) {
        for (var i = 0; i < nodes.length; i += 2) {
            var len = nodes[i];
            if (index <= len) {
                var node = nodes[i+1];
                if (Array.isArray(node)) {
                    nodes[i] += length;
                    var spilled = _insert(node, index, length, id);
                    if (spilled)
                        split(nodes, nodes[i+1], i);
                }
                else {
                    addValue(nodes, index, i, length, id);
                }
                return nodes.length > maxKeySize;
            }
            index -= len;
        }
    }

    function remove(nodes, index, length) {
        // console.log("remove:", index, length);
        var removedTotal = 0;
        for (var i = 0; i < nodes.length; i += 2) {
            var len = nodes[i]; // node.length
            var ch = nodes[i + 1];
            var removed;
            if (index <= len) {
                if (Array.isArray(ch))
                    removed = remove(ch, index, length);
                else
                    removed = Math.max(0, Math.min(length, len - index));

                // console.log("Removed:", removed);
                nodes[i] -= removed; // node.length
                length -= removed;
                removedTotal += removed;
                if (!nodes[i]) {
                    nodes.splice(i, 2);
                    i -= 2;
                }
                else if (Array.isArray(ch) && ch.length < minKeySize &&
                    (ch.length + nodes.length) <= maxKeySize) {
                    // Move elements from child to parent
                    nodes.splice.apply(nodes, [i, 2].concat(ch));
                }
                if (!length)
                    break;
                index = 0;
            }
            else {
                index -= len;
            }
        }

        for (var j = 0; j < nodes.length - 2; j += 2) {
            // console.log("CHECK:", nodes[j].id, nodes[j+1].id);
            if (!nodes[j] || nodes[j+1] !== nodes[j+3])
                continue;
            nodes[j] += nodes[j + 2];
            nodes.splice(j+1, 2);
            j -= 2;
        }
        // sanityCheck(nodes);
        return removedTotal;
    }


    function apply(nodes, op, authPoolId) {
        authPoolId = authPoolId || 0;

        var index = 0;
        var opLen;
        for (var i = 0; i < op.length; i++) {
            opLen = operations.length(op[i]);
            switch (operations.type(op[i])) {
            case "retain":
                index += opLen;
                break;
            case "insert":
                insert(nodes, index, opLen, authPoolId);
                index += opLen;
                break;
            case "delete":
                remove(nodes, index, opLen);
                break;
            default:
                throw new TypeError("Unknown operation: " + operations.type(op[i]));
            }
        }
    }

    return {
        apply: apply,
        // insert: insert,
        // remove: remove
    };
}

var applyAuthororAttributes = AuthorAttributes().apply;


/**************** ot.js ******************/
function applyOperation(userIds, docId, doc, op, callback) {
    userIds = userIds || {userId: 0};
    var userId = userIds.userId;
    Store.getWorkspaceState(function (err, ws) {
        if (err)
            return callback(err);
        try {
            doc.contents = applyContents(op, doc.contents);
            applyAuthororAttributes(doc.authAttribs, op, ws.authorPool[userId]);

            wrapSeq(Revision.create({
                operation: JSON.stringify(op),
                author: userId,
                revNum: doc.revNum + 1,
                document_id: doc.id
            }), next);
        } catch (e) {
            return next(e);
        }
    });
    function next(err) {
        if (err)
            return callback(err);
        doc.revNum++;
        Store.saveDocument(doc, /*["contents", "authAttribs", "revNum"],*/ function (err) {
            if (err)
                return callback(err);
            var msg = {
                docId: docId,
                clientId: userIds.clientId,
                userId: userId,
                revNum: doc.revNum,
                op: op
            };
            callback(null, msg);
        });
    }
}

var Store = {

    newDocument: function (tmpl, callback) {
        var contents = tmpl.contents || "";
        var _self = this;
        wrapSeq(Document.create({
            contents: contents,
            path: tmpl.path,
            fsHash: tmpl.fsHash || hashString(contents),
            authAttribs: contents.length ? JSON.stringify([contents.length, null]) : "[]",
            starRevNums: "[]",
            revNum: 0
        }), function (err, doc) {
            if (err)
                return callback(err);
            wrapSeq(Revision.create({
                document_id: doc.id,
                operation: "[]",
                revNum: 0
            }), function (err, rev) {
                if (err)
                    return callback(err);
                doc.revisions = [rev];
                callback(null, _self.$parseDocument(doc));
            });
        });
    },

    moveDocument: function (docId, newPath, callback) {
        wrapSeq(Document.find(docId), function (err, doc) {
            if (err || !doc)
                return callback(err || "No document found to rename !");
            doc.path = newPath;
            wrapSeq(doc.save(), callback);
        });
    },

    $parseDocument: function(doc) {
        if (doc.authAttribs)
            doc.authAttribs = JSON.parse(doc.authAttribs);
        if (doc.starRevNums)
            doc.starRevNums = JSON.parse(doc.starRevNums);
        return doc;
    },

    $parseDocumentCallback: function(callback) {
        var _self = this;
        return function (err, doc) {
            if (err || !doc)
                return callback(err);

            callback(null, _self.$parseDocument(doc));
        };
    },

    getDocument: function (path, attributes, callback) {
        var query = { where: {path: getDocPath(path)} };
        if (!callback) {
            callback = attributes;
            attributes = undefined;
        }
        else {
            attributes.unshift("id");
            query.attributes = attributes; // ["id", other attributes]
        }

        return wrapSeq(Document.find(query), this.$parseDocumentCallback(callback));
    },

    getRevisions: function (doc, callback) {
        wrapSeq(doc.getRevisions(), function (err, revisions) {
            if (err)
                return callback(err);
            revisions.forEach(function (rev) {
                rev.operation = JSON.parse(rev.operation);
            });
            revisions.sort(function(a, b) {
                return a.revNum - b.revNum;
            });
            callback(null, revisions);
        });
    },

    $prepareAttributes : function(doc, attributes) {
        var update = {};
        for (var i = 0; i < attributes.length; i++)
            update[attributes[i]] = doc[attributes[i]];
        return update;
    },

    saveDocument: function (doc, attributes, callback) {
        if (!callback) {
            callback = attributes;
            attributes = undefined;
        }
        else {
            // attributes.push("updated_at");
        }
        var authAttribs = doc.authAttribs;
        var starRevNums = doc.starRevNums;
        doc.authAttribs = JSON.stringify(authAttribs);
        doc.starRevNums = JSON.stringify(starRevNums);
        // doc.updated_at = new Date(doc.updated_at);

        return wrapSeq(
            attributes ? doc.updateAttributes(this.$prepareAttributes(doc, attributes)) : doc.save(),
            function(err) {
                doc.authAttribs = authAttribs;
                doc.starRevNums = starRevNums;
                callback(err, doc);
            }
        );
    },

    getWorkspaceState: function (callback) {
        // the table has only a single entry
        if (cachedWS)
            return callback(null, cachedWS);
        wrapSeq(Workspace.find(1), function (err, ws) {
            if (err || !ws)
                return callback(err || "No workspace state found !");
            ws.authorPool = JSON.parse(ws.authorPool);
            ws.colorPool = JSON.parse(ws.colorPool);
            cachedWS = ws;
            callback(null, ws);
        });
    },

    saveWorkspaceState: function (ws, callback) {
        var authorPool = ws.authorPool;
        var colorPool = ws.colorPool;
        ws.authorPool = JSON.stringify(authorPool);
        ws.colorPool = JSON.stringify(colorPool);
        return wrapSeq(ws.save(), function(err, savedWS) {
            if (err) {
                cachedWS = null;
                return callback(err);
            }
            savedWS.authorPool = authorPool;
            savedWS.colorPool = colorPool;
            cachedWS = savedWS;
            callback(null, savedWS);
        });
    },

    getUsers: function (callback) {
        if (cachedUsers)
            return callback(null, cachedUsers);
        wrapSeq(User.all(), function (err, users) {
            cachedUsers = users;
            callback(err, users);
        });
    },

    saveChatMessage: function(text, userId, callback) {
        wrapSeq(ChatMessage.create({
            text: text,
            userId: userId
        }), callback);
    },

    recentChatHistory: function(callback) {
        wrapSeq(ChatMessage.findAll({
            order: 'timestamp DESC',
            limit: 100
        }), function(err, history) {
            if (err)
                return callback(err);
            callback(null, history.reverse());
        });
    }
};


// This object should have the following structure:
//
//     { <document id> : { <client id> : true } }
var documents = {};

// This object should have the following structure:
//
//     { <document id> : { fs.FSWatcher } }
var watchers;

// The timeout after which a watcher change event won't be ignored
var WATCHER_SAVE_TIMEOUT  = 3000;

// This object should have the following structure:
//
//     { <client id> : <client> }
var clients;

// SQLite doesn't provide atomic instructions or locks
// So this variable expresses in-process locks
// Used to block concurrent edit updates while the document is being processed
//
//     { <document id> : true }
var locks = {};
function lock(key, callback) {
    if (locks[key])
        return locks[key].push(callback);
    locks[key] = [];
    callback();
}

function unlock(key) {
    var lock = locks[key];
    if (!lock || !lock.length)
        return delete locks[key];
    var next = lock.splice(0, 1)[0];
    next();
}

// Selected using colors.html
var featuredColors = [
    {r: 255, g: 146, b: 45},
    {r: 157, g: 47, b: 254},
    {r: 105, g: 215, b: 83},
    {r: 255, g: 105, b: 130},
    {r: 200, g: 109, b: 218},
    {r: 210, g: 230, b: 51},
    {r: 6, g: 134, b: 255},
    {r: 254, g: 13, b: 244},
    {r: 188, g: 255, b: 86},
    {r: 255, g: 212, b: 125},
    {r: 107, g: 4, b: 255},
    {r: 66, g: 248, b: 255}
];

function randomColor() {
    var a,b,c;
    do {
      a = Math.random();
      b = Math.random();
      c = Math.max(a,b);
    } while (c < 0.001);

    // scale them such that the larger number scales to 1.0f
    var scale = 1.0 / c;
    a *= scale;
    b *= scale;

    // Pick third value, ensure it's dark.
    c = Math.random() * 0.5;
    var rgb = new Array(3);

    var idx = Math.floor(Math.random() * 3) % 3;
    rgb[idx] = a;

    var rnd2 = Math.floor(Math.random() * 2) + 1;
    var idx2 = (rnd2 + idx) % 3;
    rgb[idx2] = b;

    var idx3 = 3 - (idx + idx2);
    rgb[idx3] = c;

    rgb = rgb.map(function(x) {
        return Math.floor(255 * x);
    });
    return {r: rgb[0], g: rgb[1], b: rgb[2]};
}

// Handle new socket connections (can be reconnects) and create a new
// document for them if there is no existing doc id supplied.
function handleConnect(userIds, client, callback) {
    var userId = userIds.userId;
    var clientId = userIds.clientId;

    // Make sure to cache user's info
    syncUserInfo();

    function syncUserInfo() {
        if (!userId)
            return console.error("[vfs-collab] Anonyous users connections not supported");

        var fullname = userIds.fullname;
        var email = userIds.email;

        wrapSeq(User.find({where: {uid: userId}}), function (err, user) {
            if (err)
                return console.error("[vfs-collab] syncUserInfo", err);

            if (!user) {
                return wrapSeq(User.create({
                    uid: userId,
                    fullname: fullname,
                    email: email
                }), function(err, createdUser) {
                    if (err)
                        return console.error("[vfs-collab] Failed creating user", err);
                    cachedUsers && cachedUsers.push(createdUser);
                    augmentWorkspaceInfo();
                });
            }

            if (user.fullname == fullname && user.email == email)
                return augmentWorkspaceInfo();

            user.fullname = fullname;
            user.email = email;
            wrapSeq(user.save(), function (err, user) {
                if (err)
                    return console.error("[vfs-collab] Failed updating user", err);
                augmentWorkspaceInfo();
            });
        });
    }

    function augmentWorkspaceInfo() {
        Store.getWorkspaceState(function (err, ws) {
            if (err)
                return console.error("[vfs-collab] augmentWorkspaceInfo", err);
            var authorPool = ws.authorPool;
            var colorPool = ws.colorPool;

            if (authorPool[userId] && colorPool[userId])
                return doConnect(authorPool, colorPool);

            if (!authorPool[userId])
                authorPool[userId] = Object.keys(authorPool).length + 1;
            if (!colorPool[userId])
                colorPool[userId] = featuredColors[authorPool[userId]-1] || randomColor();
            Store.saveWorkspaceState(ws, function (err) {
                if (err)
                    return console.error("[vfs-collab] augmentWorkspaceInfo", err);
                doConnect(authorPool, colorPool);
            });
        });
    }

    function doConnect (authorPool, colorPool) {
        Store.getUsers(function (err, users) {
            if (err)
                return console.error("[vfs-collab] getUsers", err);

            if (users.length > 1)
                console.error("[vfs-collab] User", userIds.userId, "is connecting to a workspace with",
                    users.length - 1, "other workspace members");

            var onlineClientIds = Object.keys(clients);
            var onlineUserIds = {};
            for (var clId in clients)
                onlineUserIds[clients[clId].userIds.userId] = true;
            onlineUserIds = Object.keys(onlineUserIds);

            if (onlineUserIds.length > 1)
                console.error("[vfs-collab] User", userIds.userId, "is connecting Collab with",
                    onlineClientIds.length-1, "other clients & online workspace members", onlineUserIds);

            var usersMap = {};
            users.forEach(function (user) {
                usersMap[user.uid] = user;
            });

            broadcast({
                type: "USER_JOIN",
                data: {
                    userId: userId,
                    clientId: clientId,
                    fs: userIds.fs,
                    authorPool: authorPool,
                    colorPool: colorPool,
                    users: usersMap,
                    onlineUserIds: onlineUserIds
                }
            }, client);

            Store.recentChatHistory(function (err, chatHistory) {
                if (err)
                    console.error("[vfs-collab] recentChatHistory", err);

                client.send({
                    type: "CONNECT",
                    data: {
                        // clients: onlineClientIds, // Online clients (clientIds)
                        onlineUserIds: onlineUserIds, // Online members (userIds)
                        myClientId: clientId,
                        myUserId: userId,
                        fs: userIds.fs,
                        authorPool: authorPool,
                        colorPool: colorPool,
                        users: usersMap,
                        chatHistory: (collabReadAccess(userIds.fs) && chatHistory) || []
                    }
                });
            });
        });
    }
}

function collabReadAccess (fs) {
    return /r/.test(fs);
}

function collabWriteAccess (fs) {
    return /w/.test(fs);
}

function handleUpdate(userIds, client, message) {
    var docId = message.docId;
    var clientId = userIds.clientId;
    var newRev = message.revNum;
    var docL;

    function callback(err) {
        unlock(docId);
        if (err) {
            console.error("[vfs-collab]", err);
            syncCommit(err);
        }
    }

    function syncCommit(err) {
        client.send({
            type: "SYNC_COMMIT",
            data: {
                docId: docId,
                revNum: docL && docL.revNum,
                reason: err
            }
        });
    }

    if (!documents[docId] || !documents[docId][clientId] || !client.openDocIds[docId])
        return callback("Trying to update a non-member document !",
            docId, clientId, documents[docId] && Object.keys(documents[docId]), Object.keys(client.openDocIds),
            Object.keys(documents), Object.keys(clients));

    if (!collabWriteAccess(userIds.fs))
        return callback("User " + userIds.userId + " don't have write access to edit document " + docId + " - fs: " + userIds.fs);

    lock(docId, function () {
        Store.getDocument(docId, ["contents", "authAttribs", "revNum"], function (err, doc) {
            if (err || !doc)
                return callback(err || ("No Document to update ! " + docId));

            docL = doc;

            if (doc.revNum !== newRev-1)
                return callback("Version log:" + docId + " "  + doc.revNum + " " + newRev);

            // message.author for udno auth attributes
            applyOperation(userIds, docId, doc, message.op, function (err, msg) {
                if (err)
                    return callback("OT Error:" + err);

                msg.selection = message.selection;

                broadcast({
                    type: "EDIT_UPDATE",
                    data: msg
                }, client, docId);

                delete msg.op;
                delete msg.selection;

                client.send({
                    type: "EDIT_UPDATE",
                    data: msg
                });

                callback();
            });
        });
    });
}

function handleChatMessage(userIds, client, msg) {
    var text = msg.text;
    var userId = userIds.userId;

    // Save the chat message and broadcast it
    Store.saveChatMessage(text, userId, function (err, message) {
      if (err)
          return console.error("[vfs-collab] saveChatMessage:", err);
      var msg = {
          type: "CHAT_MESSAGE",
          data: {
            id: message.id,
            userId: userId,
            timestamp: message.timestamp,
            text: text
          }
      };

      broadcast(msg);
  });
}

function handleCursorUpdate(userIds, client, data) {
    var docId = data.docId;
    var clientId = userIds.clientId;

    if (!documents[docId] || !documents[docId][clientId] || !client.openDocIds[docId])
        return console.error("[vfs-collab] Trying to select in a non-member document !",
            docId, clientId, documents[docId] && Object.keys(documents[docId]), Object.keys(client.openDocIds),
            Object.keys(documents), Object.keys(clients));

    documents[docId][clientId].selection = data.selection;
    data.clientId = clientId;
    data.userId = userIds.userId;
    broadcast({
        type: "CURSOR_UPDATE",
        data: data
    }, client, docId);
}

function broadcast(message, sender, docId) {
    var toClientIds = docId ? documents[docId] : clients;
    var audienceNum = 0;
    for (var clientId in toClientIds) {
        var client = clients[clientId];
        // Exclude sender if exists
        if (client === sender || !client)
            continue;
        client.send(message);
        audienceNum++;
    }
    // if (audienceNum)
    //    console.error("[vfs-collab] Broadcast to:", audienceNum, "clients", message);
}

function initWatcher(docId) {
    function callback(err) {
        if (err)
            console.error("[vfs-collab] WATCH ERR:", docId, err);
        unlock(docId);
    }

    var absPath = getAbsolutePath(docId);

    function doWatcherSync (callback) {
        var mtime = Date.now();
        lock(docId, function () {
            var timeDiff = mtime - watcher.mtime
            if (timeDiff < WATCHER_SAVE_TIMEOUT)
                return callback();

            console.error("[vfs-collab] WATCH SYNC:", docId, timeDiff);
            watcher.mtime = mtime;
            Store.getDocument(docId, function (err, doc) {
                if (err)
                    return callback(err);
                syncDocument(docId, doc, function (err, doc2) {
                    if (err)
                        return callback(err);
                    docSaveFile(docId, doc2, -1, true, callback);
                });
            });
        });
    }

    try {
        var watcher = Fs.watch(absPath, {persistent: false}, function (eventName) {
            console.error("[vfs-collab] WATCH trial:", eventName, docId, Date.now());
            if (eventName === "change") {
                doWatcherSync(callback);
            }
            else if (eventName === "rename") {
                watcher.close();
                delete watchers[docId];
                // the timeout only to allow git commands (delete and create files):
                // git checkout, git merge
                setTimeout(function () {
                    exists(absPath, function (exist) {
                        // already managed by deletion watcher
                        // The document should be deleted ?! - we do 4-hour cleanups
                        if (!exist)
                            return;

                        doWatcherSync(function (err) {
                            if (err)
                                return callback(err);
                            initWatcher(docId);
                            callback();
                        });
                    });
                }, WATCHER_SAVE_TIMEOUT);
            }
        });
        watcher.mtime = Date.now() - WATCHER_SAVE_TIMEOUT;
        watchers[docId] = watcher;
    } catch (e) {
        console.error("[vfs-collab] Watcher failed for", docId, e);
    }
}

function handleJoinDocument(userIds, client, data) {
    var docId = data.docId;
    var clientId = userIds.clientId;
    var userId = userIds.userId;

    function callback (err) {
        if (err) {
            console.error("[vfs-collab] handleJoinDocument ERR:", docId, err);
            client.send({
                type: "JOIN_DOC",
                data: {
                    clientId: clientId,
                    docId: docId,
                    err: err
                }
            });
        }
        unlock(docId);
    }

    if (!collabReadAccess(userIds.fs))
        return callback("User " + userId + " don't have read access to join document " + docId + " - fs: " + userIds.fs);

    lock(docId, function () {
        Store.getDocument(docId, function (err, doc) {
            if (err)
                return callback("getDocument " + err);

            if (doc && documents[docId])
                return joinDocument(doc);

            console.error("[vfs-collab] Joining a closed document", docId, " - Syncing");
            syncDocument(docId, doc, function (err, doc2) {
                if (err)
                    return callback(err);
                joinDocument(doc2);
            });
        });
    });

    function joinDocument(doc) {
        if (!documents[docId]) {
            documents[docId] = {};
            initWatcher(docId);
             console.error("[vfs-collab] User", userId, "is joining document", docId);
        }
        else {
            console.error("[vfs-collab] User", userId, "is joining a document", docId, "with",
                Object.keys(documents[docId]).length, "other document members");
        }

        var docHash = hashString(doc.contents);

        var clientDoc = JSON.stringify({
            selections: documents[docId],
            authAttribs: doc.authAttribs,
            contents: doc.contents,
            fsHash: doc.fsHash,
            docHash: docHash,
            revNum: doc.revNum,
            created_at: doc.created_at,
            updated_at: doc.updated_at
        });

        documents[docId][clientId] = userIds;
        client.openDocIds[docId] = true;

        var chunkSize = 10*1024; // 10 KB
        var contentsLen = clientDoc.length;
        var chunksLen = Math.ceil(contentsLen / chunkSize);
        for (var i = 0; i < contentsLen; i += chunkSize) {
            var chunk = clientDoc.slice(i, i + chunkSize);
            client.send({
                type: "JOIN_DOC",
                data: {
                    userId: userId,
                    clientId: clientId,
                    docId: docId,
                    chunkNum: (i / chunkSize) + 1,
                    chunksLength: chunksLen,
                    chunk: chunk
                }
            });
        }

        broadcast({
            type: "JOIN_DOC",
            data: {
                docId: docId,
                userId: userId,
                clientId: clientId
            }
        }, client);

        callback();
    }
}

function handleGetRevisions(userIds, client, data) {
    var docId = data.docId;

    function callback (err) {
        if (err)
            console.error("[vfs-collab] handleGetRevisions ERR:", docId, err);
        unlock(docId);
    }

    if (!collabReadAccess(userIds.fs))
        return callback("User " + userIds.userId + " don't have read access to get revisions " + docId + " - fs: " + userIds.fs);

    lock(docId, function () {
        Store.getDocument(docId, function (err, doc) {
            if (err)
                return callback("getDocument " + err);

            Store.getRevisions(doc, function (err, revisions) {
                var docRevisions = JSON.stringify({
                    revisions: revisions,
                    starRevNums: doc.starRevNums,
                    revNum: doc.revNum
                });

                var chunkSize = 10*1024; // 10 KB
                var contentsLen = docRevisions.length;
                var chunksLen = Math.ceil(contentsLen / chunkSize);
                for (var i = 0; i < contentsLen; i += chunkSize) {
                    var chunk = docRevisions.slice(i, i + chunkSize);
                    client.send({
                        type: "GET_REVISIONS",
                        data: {
                            userId: userIds.userId,
                            clientId: userIds.clientId,
                            docId: data.docId,
                            chunkNum: (i / chunkSize) + 1,
                            chunksLength: chunksLen,
                            chunk: chunk
                        }
                    });
                }
                callback();
            });
        });
    });

}

function handleLeaveDocument(userIds, client, data) {
    var docId = data.docId;
    var userId = userIds.userId;
    var clientId = userIds.clientId;
    if (!documents[docId] || !documents[docId][clientId] || !client.openDocIds[docId])
        return console.error("[vfs-collab] Trying to leave a non-member document !",
            docId, clientId, documents[docId] && Object.keys(documents[docId]), Object.keys(client.openDocIds),
            Object.keys(documents), Object.keys(clients));
    delete client.openDocIds[docId];
    console.error("[vfs-collab]", clientId, " is leaving document", docId);
    delete documents[docId][clientId];
    if (!Object.keys(documents[docId]).length) {
        console.error("[vfs-collab] Closing document", docId);
        closeDocument(docId);
    }

    broadcast({
        type: "LEAVE_DOC",
        data: {
            docId: docId,
            userId: userId,
            clientId: clientId
        }
    }, client);
}

function closeDocument(docId) {
    delete documents[docId];

    setTimeout(function () {
        compressDocument(docId, {
            MAX_REVISION_NUM: 256,
            COMPRESSED_REV_NUM: 128
        });
    }, 100000);

    if (watchers[docId]) {
        watchers[docId].close();
        delete watchers[docId];
    }
}

function compressDocument(docId, options, _callback) {
    if (documents[docId])
        return;

    var ALREADY_COMPRESSED = "ALREADY_COMPRESSED";
    var MAX_REVISION_NUM   = options.MAX_REVISION_NUM;
    var COMPRESSED_REV_NUM = options.COMPRESSED_REV_NUM;

    var doc, revisions, path;
    var newRevisions, newStarRevNums;
    var starsHash, rev0Contents, lastRevTime, docTimeDiff, optimalRevTimeDiff;

    // compaction modes
    var mergeDifferentAuthors = false;
    var isAggressive = false;

    var secondTime   = 1000;
    var minuteTime   = secondTime * 60;
    var hourTime     = minuteTime * 60;
    var dayTime      = hourTime * 24;
    var fourDaysTime = dayTime << 2;

    function callback(err) {
        unlock(docId);
        if (err === ALREADY_COMPRESSED)
            err = undefined;
        if (err)
            console.error("[vfs-collab] ERROR Closing Document", docId, err);
        _callback && _callback(err);
    }

    function cloneRevision(rev, revNum) {
        return {
            document_id : rev.document_id,
            operation   : rev.operation.slice(),
            author      : rev.author,
            revNum      : revNum,
            created_at  : rev.created_at,
            updated_at  : rev.updated_at
        };
    }

    function shouldMergeTimeDiff(rev, lastRev) {
        if (lastRev.author != rev.author) {
            if (mergeDifferentAuthors)
                lastRev.author = "0";
            else
                return false;
        }

        var latestRevDiff = lastRevTime - rev.created_at;
        var prevRevDiff = rev.created_at - lastRev.created_at;

        if (isAggressive)
            return prevRevDiff < (optimalRevTimeDiff << 1);

        if (latestRevDiff < hourTime)
            // previous revision is < 8-seconds away (co-editing)
            return prevRevDiff < (secondTime << 3);
        else if (latestRevDiff < dayTime)
            // previous revision is < 4-minutes away
            return prevRevDiff < (minuteTime << 2);
        else if (latestRevDiff < fourDaysTime)
            // previous revision is < 1-hour away
            return prevRevDiff < (hourTime);
        else
            return prevRevDiff < optimalRevTimeDiff;
    }

    lock(docId, function() {
        async.series([
            function (next) {
                Store.getDocument(docId, function (err, docL) {
                    if (err || !docL)
                        return next(err || "No document to close !");
                    path = docL.path;
                    doc = docL;
                    next();
                });
            },
            function (next) {
                Store.getRevisions(doc, function (err, revisionsL) {
                    if (err || !revisionsL)
                        return next(err || "No document revisions found !");
                    if (revisionsL.length < MAX_REVISION_NUM)
                        return next(ALREADY_COMPRESSED);
                    revisions = revisionsL;
                    next();
                });
            },
            function prepare(next) {
                // compress to the latest N/2 saves only
                var newStars = doc.starRevNums.slice(-COMPRESSED_REV_NUM);

                starsHash = {};
                var i;
                for (i = 0; i < newStars.length; i++)
                    starsHash[newStars[i]] = true;

                rev0Contents = doc.contents;
                for (i = revisions.length - 1; i > 0; i--) {
                    var op = operations.inverse(revisions[i].operation);
                    revisions[i].contents = rev0Contents;
                    rev0Contents = applyContents(op, rev0Contents);
                }

                lastRevTime = revisions[revisions.length-1].created_at;
                docTimeDiff = lastRevTime - revisions[0].created_at;
                optimalRevTimeDiff = docTimeDiff / COMPRESSED_REV_NUM;

                next();
            },
            function compressDoc (next) {
                var shouldCompress = revisions.length - COMPRESSED_REV_NUM;

                console.error("[vfs-collab] Compress document trial", docId, shouldCompress, mergeDifferentAuthors, isAggressive);

                newRevisions = [ cloneRevision(revisions[0], 0) ];
                newStarRevNums = [];

                var lastRev = {author: -9};
                var prevContents, prevLastContents;
                var lastContents = rev0Contents;
                var i, rev;
                for (i = 1; i < revisions.length && shouldCompress; i++) {
                    rev = revisions[i];
                    prevLastContents = lastContents;
                    lastContents = applyContents(rev.operation, lastContents);
                    // Check if can merge revisions and clear lastRev's author if different & can merge different authors
                    // TODO: remove the side-effect on parameters the function do
                    if (shouldMergeTimeDiff(rev, lastRev)) {
                        var compressedOp = operations.operation(prevContents, lastContents);
                        lastRev.operation = compressedOp;
                        shouldCompress--;
                    }
                    else {
                        lastRev = cloneRevision(rev, newRevisions.length);
                        newRevisions.push(lastRev);
                        prevContents = prevLastContents;
                    }
                    if (starsHash[i] && !lastRev.isStar) {
                        newStarRevNums.push(lastRev.revNum);
                        lastRev.isStar = true;
                    }
                }
                if (!shouldCompress) {
                    while (i < revisions.length) {
                        newRevisions.push(cloneRevision(revisions[i++], newRevisions.length));
                    }
                }
                else if (!mergeDifferentAuthors) {
                    console.error("[vfs-collab] Merge single-author failed to compact the document enough", revisions.length, newRevisions.length);
                    mergeDifferentAuthors = true;
                    return compressDoc(next);
                }
                else if (!isAggressive) {
                    console.error("[vfs-collab] Merge multi-author failed to compact the document enough", revisions.length, newRevisions.length);
                    isAggressive = true;
                    return compressDoc(next);
                }
                else if (newRevisions.length >= MAX_REVISION_NUM) {
                    console.error("[vfs-collab] All compression modes failed to compact the document enough", revisions.length, newRevisions.length);
                }

                console.error("[vfs-collab] Compressed document:", revisions.length, newRevisions.length,
                    "Different Authors:", mergeDifferentAuthors,
                    "isAggressive:", isAggressive);

                // var newContents = rev0Contents;
                // for (i = 1; i < newRevisions.length; i++) {
                //     var newRev = newRevisions[i];
                //     newContents = applyContents(newRev.operation, newContents);
                // }
                // console.error("[vfs-collab] Compressed document:", newContents == doc.contents, revisions.length, newRevisions.length);
                // console.error("[vfs-collab] New Revisions:", newRevisions);
                // console.error("[vfs-collab] Stars:", doc.starRevNums, newStarRevNums);

                next();
            },
            function (next) {
                wrapSeq(Revision.destroy({document_id: doc.id}), next);
            },
            function (next) {
                doc.starRevNums = newStarRevNums;
                doc.revNum = newRevisions.length - 1;
                Store.saveDocument(doc, /*["revNum", "starRevNums"],*/ next);
            },
            function (next) {
                newRevisions.forEach(function(newRev) {
                    delete newRev.isStar;
                    newRev.operation = JSON.stringify(newRev.operation);
                });
                wrapSeq(Revision.bulkCreate(newRevisions), next);
            }
        ], callback);
    });
}

function handleSaveFile(userIds, client, data) {
    var docId = data.docId;
    var userId = userIds.userId;

    function callback(err) {
        unlock(docId);
        if (err) {
            console.error("[vfs-collab]", err);
            client.send({
                type: "FILE_SAVED",
                data: {
                    docId: docId,
                    err: err
                }
            });
        }
    }

    lock(docId, function () {
        Store.getDocument(docId, ["contents", "revNum", "starRevNums"], function (err, doc) {
            if (err || !doc)
                return callback((err || "Writing a non-collab document !") + " : " +  docId);

            console.error("[vfs-collab] Saving file", docId);
            if (watchers[docId])
                watchers[docId].mtime = Date.now();

            Fs.writeFile(getAbsolutePath(docId), doc.contents, "utf8", function (err) {
                if (err)
                    return callback("Failed saving file ! : " + docId  + " ERR: " + err);

                docSaveFile(docId, doc, userId, !data.silent, callback);
            });
        });
    });
}

function docSaveFile(docId, doc, userId, star, callback) {
    if (star && doc.starRevNums.indexOf(doc.revNum) === -1)
        doc.starRevNums.push(doc.revNum);

    doc.fsHash = hashString(doc.contents);
    Store.saveDocument(doc, /*["fsHash", "starRevNums"],*/ function (err) {
        console.error("[vfs-collab] starRevision added", doc.revNum);
        var data = {
            userId: userId,
            docId: docId,
            star: star,
            revNum: doc.revNum
        };
        broadcast({
            type: "FILE_SAVED",
            data: data
        }, null, docId);
        callback();
    });
}

function onConnect(userIds, client) {
    var userId = userIds.userId;
    var clientId = userIds.clientId;

    console.error("[vfs-collab] CONNECTED UserID: " + userId + " & ClientId: " + clientId);

    client.on("message", function (msg) {
        // console.error("[vfs-collab] Message from ",  userIds, ": " + msg);
        try {
            msg = JSON.parse(msg);
        } catch(e) {
            return console.error("[vfs-collab] Can't parse client data !", msg);
        }
        try {
            handleUserMsg(msg);
        } catch(e) {
            return console.error("[vfs-collab] Can't handle user msg", msg, e);
        }
    });

    handleConnect(userIds, client);

    function handleUserMsg(msg) {
        switch (msg.type) {
        case "JOIN_DOC":
            handleJoinDocument(userIds, client, msg.data);
            break;
        case "GET_REVISIONS":
            handleGetRevisions(userIds, client, msg.data);
            break;
        case "LEAVE_DOC":
            handleLeaveDocument(userIds, client, msg.data);
            break;
        case "EDIT_UPDATE":
            handleUpdate(userIds, client, msg.data);
            break;
        case "CURSOR_UPDATE":
            handleCursorUpdate(userIds, client, msg.data);
            break;
        case "SAVE_FILE":
            handleSaveFile(userIds, client, msg.data);
            break;
        case "CHAT_MESSAGE":
            handleChatMessage(userIds, client, msg.data);
            break;
        case "PING":
            client.send({type: "PING"});
            break;
        default:
            throw new Error("Unknown message message type: " + msg.type);
        }
    }

    client.on("disconnect", function () {
        for (var docId in client.openDocIds)
            handleLeaveDocument(userIds, client, {docId: docId});
        broadcast({
            type: "USER_LEAVE",
            data: {
                userId: userId,
                clientId: clientId
            }
        }, client);
        console.error("[vfs-collab] DISCONNECTED a socket with userId " + userId);
    });
}

function normalizeTextLT(text) {
    var match = text.match(/^.*?(\r\n|\r|\n)/m);
    var nlCh = match ? match[1] : "\n";
    return text.split(/\r\n|\r|\n/).join(nlCh);
}

function isBinaryFile(file, callback) {
    var max_bytes = 512;
    exists(file, function (exists) {
        if (!exists)
            return callback(null, false);

        Fs.open(file, 'r', function(err, descriptor){
            if (err)
                return callback(err);
            var bytes = new Buffer(max_bytes);
            // Read the file with no encoding for raw buffer access.
            Fs.read(descriptor, bytes, 0, bytes.length, 0, function(err, size, bytes){
                Fs.close(descriptor, function(err2){
                    if (err || err2)
                        return callback(err || err2);
                    return callback(null, isBinaryCheck(size, bytes));
                });
            });
        });
    });

    function isBinaryCheck (size, bytes) {
        if (size === 0)
            return false;

        var suspicious_bytes = 0;
        var total_bytes = Math.min(size, max_bytes);

        if (size >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF) {
            // UTF-8 BOM. This isn't binary.
            return false;
        }

        for (var i = 0; i < total_bytes; i++) {
            if (bytes[i] === 0) { // NULL byte--it's binary!
                return true;
            }
            else if ((bytes[i] < 7 || bytes[i] > 14) && (bytes[i] < 32 || bytes[i] > 127)) {
                // UTF-8 detection
                if (bytes[i] > 191 && bytes[i] < 224 && i + 1 < total_bytes) {
                    i++;
                    if (bytes[i] < 192) {
                        continue;
                    }
                }
                else if (bytes[i] > 223 && bytes[i] < 239 && i + 2 < total_bytes) {
                    i++;
                    if (bytes[i] < 192 && bytes[i + 1] < 192) {
                        i++;
                        continue;
                    }
                }
                suspicious_bytes++;
                // Read at least 32 bytes before making a decision
                if (i > 32 && (suspicious_bytes * 100) / total_bytes > 10) {
                    return true;
                }
            }
        }

        if ((suspicious_bytes * 100) / total_bytes > 10) {
            return true;
        }

        return false;
    }
}

function syncDocument(docId, doc, callback) {
    var file = Path.join(basePath, docId);
    isBinaryFile(file, function (err, isBinary) {
        if (err)
            return callback("SYNC: Binary check failed - ERR: " + err);
        if (isBinary)
            return callback("SYNC: Binary file opened " + isBinary);

        Fs.readFile(file, "utf8", function (err, contents) {
            if (err)
                return callback(err);

            var normContents = normalizeTextLT(contents);
            if (contents !== normContents)
                console.error("[vfs-collab] SYNC: Line terminator inconsistency found - normalising:", docId);

            var fsHash = hashString(normContents);

            if (!doc) {
                console.error("[vfs-collab] SYNC: Creating document:", docId, fsHash);

                Store.newDocument({
                    path: docId,
                    contents: normContents,
                    fsHash: fsHash
                }, callback);
            }
            // update database OT state
            else if (fsHash !== doc.fsHash && doc.contents != normContents) {
                var op = operations.operation(doc.contents, normContents);
                console.error("[vfs-collab] SYNC: Updating document:", docId, op.length, fsHash, doc.fsHash);
                // non-user sync operation
                doc.fsHash = fsHash; // applyOperation will save it for me
                applyOperation(null, docId, doc, op, function (err, msg) {
                    if (err)
                        return callback("SYNC: Failed updating OT database document state !! " + err.toString());
                    broadcast({
                        type: "EDIT_UPDATE",
                        data: msg
                    }, null, docId);

                    callback(null, doc);
                });
            }
            else
                callback(null, doc);
        });
    })
}

// ********* VFS Stream, net.Socket Collab Communication Infrastructure ************ //

function createServer() {
    var server = net.createServer(function(client) {

        // console.error("[vfs-collab] Client connected");
        var userIds;
        var isClosed = false;

        client.send = function (msg) {
            if (isClosed)
                return;
            msg.command = msg.command || "vfs-collab";
            var strMsg = JSON.stringify(msg);
            client.write(strMsg + "\0\0");
        };

        client.on("data", function handShake(data) {
            client.removeListener("data", handShake);
            client.on("data", onData);

            userIds = JSON.parse(data);
            client.userIds = userIds;
            client.openDocIds = {};
            clients[userIds.clientId] = client;
            // console.error("[vfs-collab] Server handshaked", Object.keys(clients).length);

            // handshaking the client
            client.write(data.toString());

            if (server.collabInited)
                onConnect(userIds, client);
            else
                server.on("collab.init", function () {
                    onConnect(userIds, client);
                });
        });

        var buff = [];

        function onData(data) {
            data = data.toString();
            var idx;
            while (true) {
                idx = data.indexOf("\0\0");
                if (idx === -1)
                    return data && buff.push(data);
                buff.push(data.substring(0, idx));
                var clientMsg = buff.join("");
                data = data.substring(idx + 2);
                buff = [];
                client.emit("message", clientMsg);
            }
        }

        client.on("close", onClose);
        client.on("end", onClose);

        function onClose() {
            if (isClosed)
                return;
            isClosed = true;
            delete clients[userIds.clientId];
            client.emit("disconnect");
            // console.error("[vfs-collab] Client disconnected", Object.keys(clients).length);
        }

        client.on("error", function (err) {
            onClose();
            console.error("[vfs-collab] CLIENT SOCKET ERROR", err);
            client.destroy();
        });
    });
    return server;
}

function initSocket(userIds, callback) {

    // var COLLAB_PORT = 33366;
    // var COLLAB_HOST = process.env.OPENSHIFT_DIY_IP || "localhost";

    var projectWD = getProjectWD();
    var server;
    var isServer = false;

    // startServer();
    // file sockets can have multiple servers open on the same path
    // So, we connect first
    var sockPath = process.platform == "win32"
        ? "\\\\.\\pipe\\"+ projectWD +"\\collab.sock"
        : Path.join(projectWD, "collab.sock");
    clientConnect();

    function startServer() {
        server = createServer();
        console.error("[vfs-collab] PID:", PID, "Socket:", sockPath,
             "ClinetId:", userIds.clientId, " & UserId:", userIds.userId);

        async.series([
            function (next) {
                Fs.mkdir(Path.dirname(projectWD), function (err) {
                    if (err && err.code !== "EEXIST")
                        return next(err);
                    next();
                });
            },
            function (next) {
                Fs.mkdir(projectWD, function (err) {
                    if (err && err.code !== "EEXIST")
                        return next(err);
                    next();
                });
            },
            function (next) {
                Fs.unlink(sockPath, function (err) {
                    if (err && err.code !== "ENOENT")
                        return next(err);
                    next();
                });
            },
        ], function(err) {
            if (err)
                return callback(err);

            server.listen(sockPath, function () {
                isServer = true;
                server.collabInited = false;

                // init server state
                documents = {};
                watchers = {};
                clients = {};

                installServer(function (err) {
                    if (err)
                        return callback(err);
                    initDB(function (err) {
                        if (err)
                            return callback(err);
                        server.collabInited = true;
                        clientConnect();
                        server.emit("collab.init");
                    });
                });

                server.on("close", function () {
                    console.error("[vfs-collab] Server closed");
                    // Should handover to another server (if exists)
                    // e.g. Elect the first client as the new master.
                });
            });

            server.on("error", function (err) {
                if (err.code === "EADDRINUSE")
                    return clientConnect();
                console.error("[vfs-collab] Server error", err);
            });
        });
    }

    function clientConnect () {
        var client = net.connect(sockPath, function () {
            client.userIds = userIds;

            var stream = client.clientStream = new Stream();
            stream.readable = true;

            // console.error("[vfs-collab] User connected:", userIds.clientId);

            client.on("data", function handShake(data) {
                // console.error("[vfs-collab]", "Client handshaked", data.toString());
                client.removeListener("data", handShake);
                client.on("data", onData);
            });

            var buff = [];

            function onData(data) {
                data = data.toString();
                var idx;
                while (true) {
                    idx = data.indexOf("\0\0");
                    if (idx === -1)
                        return buff.push(data);
                    buff.push(data.substring(0, idx));
                    var streamData = buff.join("");
                    data = data.substring(idx + 2);
                    buff = [];
                    stream.emit("data", streamData);
                }
            }

            client.on("close", function() {
                // console.error("[vfs-collab] Connection closed :", userIds.userId);
                stream.emit("end");
            });

            client.write(JSON.stringify(userIds), "utf8", function() {
                callback(null, client, isServer && server);
            });
        });

        client.on("error", function (err) {
            if (err && (err.code === "ECONNREFUSED" || err.code === "ENOENT"))
                startServer();
            else
                console.error("[vfs-collab] CLIENT SOCK ERR", err);
        });
    }
}

var exports = module.exports = function (vfs, options, register) {

    var vfsClientMap = {};
    var isMaster;

    register(null, {
        connect: function (basePathL, clientId, callback) {
            // old code compatability
            var user = options.user;
            var userIds = {
                userId: user.uid,
                email: user.email,
                fullname: user.fullname,
                clientId: clientId,
                fs: options.readonly ? "r" : "rw"
            };

            PID = options.project.pid;
            basePath = Path.normalize(basePathL);

            var _self = this;

            function cleanOldClient() {
                if (!vfsClientMap[clientId])
                    return;
                console.error("[vfs-collab] Diposing old client - possible reconnect ?", clientId);
                _self.dispose(clientId);
            }

            cleanOldClient();

            initSocket(userIds, function (err, client, server) {
                if (err)
                    return callback(new Error(err));

                client.netServer = server;

                cleanOldClient();
                vfsClientMap[clientId] = client;
                isMaster = !!server;

                callback(null, {
                    stream: client.clientStream,
                    isMaster: isMaster
                });
            });
        },

        send: function (clientId, msg) {
            // console.error("[vfs-collab] IN-STREAM", msg);
            var client = vfsClientMap[clientId];
            if (client)
                client.write(JSON.stringify(msg)+"\0\0");
        },

        dispose: function (clientId) {
            var client = vfsClientMap[clientId];
            if (!client)
                return;
            client.end();
            client.destroy();
            // TODO: properly handover
            // if (client.netServer)
            //    client.netServer.close();
            delete vfsClientMap[clientId];
        }
    });
};

// export for testing
exports.Store = Store;
exports.compressDocument = compressDocument;

/*
// Quick testing:
basePath = __dirname;
dbFilePath = __dirname + "/test.db";
initDB(function(){
    console.error("DB inited");
    Store.newDocument({
        path: "test.txt",
        contents: Fs.readFileSync(__dirname + "/collab_test.js", "utf8")
    }, function (err) {
        if (err)
            return console.error(err);
        console.error("Test document created");
        Store.getDocument("test.txt", {include: ['Revision'] }, function (err, doc) {
            console.error("ERR1", err);
            // console.error(JSON.stringify(doc));
            Store.getWorkspaceState(function (err, ws) {
                console.log("ERR2:", err);
            });
        });
    });
});
lock("abc", function () {
    console.log("first locking");
    setTimeout(function () {
        unlock("abc");
    }, 100);
});

lock("abc", function () {
    console.log("second locking");
    setTimeout(function () {
        unlock("abc");
    }, 100);
});
*/
