(function (definition) {
  if (typeof exports === "object") {
    // CommonJS
    module.exports = definition();
  } else if (typeof define === "function" && define.amd) {
    // RequireJS
    define(definition);
  } else {
    // <script>
    Global = definition();
  }
})(function () {
  'use strict';
  return (function () {
    var Global = {};
    var G = Global;

    G.RID_MIN = 100000000000000;
    G.RID_MAX = G.RID_MIN * 10 - 1;
    G.rid = function rid() {
      return "_" + (Math.floor(Math.random() * (G.RID_MAX - G.RID_MIN + 1)) + G.RID_MIN).toString(10);
    };

    G.clone = function clone(origin) {
      return JSON.parse(JSON.stringify(origin));
    };

    G.language = window.navigator.language;

    /********************************************************************************
     * Messages
     */

    G.messages = {};

    (function (messages) {
      messages.en = {};
      messages.ja = {};
      messages["ja-JP"] = ja;
      var en = messages.en;
      var ja = messages.ja;
      var key;

      key = "#cancel";
      en[key] = "Cancel";
      ja[key] = "キャンセル";

      key = "#confirmation";
      en[key] = "Confirmation";
      ja[key] = "確認";

      key = "#confirmation-message";
      en[key] = "Are you sure?";
      ja[key] = "よろしいですか?";

      key = "#error-of-request";
      en[key] = "Request error";
      ja[key] = "リクエストエラー";

      key = "#error-of-setting-up-requesting";
      en[key] = "Setting up request error";
      ja[key] = "リクエスト準備エラー";

      key = "#hello";
      en[key] = "Hello";
      ja[key] = "こんにちは";

      key = "#http-status-400";
      en[key] = "Bad Request";
      ja[key] = "不正なリクエストです";

      key = "#http-status-404";
      en[key] = "Not Found";
      ja[key] = "見つかりません";

      key = "#http-status-500";
      en[key] = "Internal Server Error";
      ja[key] = "サーバー内部エラー";

      key = "#length-min-max";
      en[key] = "Minimum {min} characters and maximum {max} characters.";
      ja[key] = "{min}文字以上、{max}文字以下で入力して下さい";

      key = "#login-failed";
      en[key] = "The login attempt failed.";
      ja[key] = "ログインに失敗しました";

      key = "#login-succeeded";
      en[key] = "The login attempt succeeded.";
      ja[key] = "ログインに成功しました";

      key = "#ok";
      en[key] = "OK";
      ja[key] = "OK";

      key = "#please-input";
      en[key] = "Please input";
      ja[key] = "入力して下さい";

      key = "#updated";
      en[key] = "Updated";
      ja[key] = "更新しました";

    })(G.messages);

    var keyRex = /(#[\w-]+)\s*(\{[^}]+\})?/;
    G.getMsg = function (keyText) {
      var result = keyRex.exec(keyText);
      if (result === null) return "";
      var key = result[1];
      key = (key || "").trim();
      var msglng = this.messages[this.language] || this.messages.en;
      var msg = (msglng && msglng[key]) || "";

      var opts = result[2];
      if (opts) {
        try {
          var optsObj = JSON.parse(opts);
          for (var name in optsObj) {
            msg = msg.replace("{" + name + "}", optsObj[name]);
          }
        } catch (e) { }
      }

      return msg;
    };

    G.putMsgs = function (selectors, rootElem) {
      rootElem = rootElem || document;
      selectors = selectors || ".msg";
      var elems = rootElem.querySelectorAll(selectors);
      for (var i = 0; i < elems.length; ++i) {
        var elem = elems.item(i);
        elem.setAttribute("data-original-inner-html", elem.innerHTML);
        elem.textContent = this.getMsg(elem.innerHTML);
      }
    };

    /********************************************************************************
     * catcher
     */
    G.catcher = function (io) {
      return function (error) {
        if (error.response) {
          io.status = "#http-status-" + error.response.status;
        } else if (error.request) {
          io.status = "#error-of-request";
        } else {
          io.status = "#error-of-setting-up-requesting";
        }
      };
    };

    /********************************************************************************
     * modal
     */

    var modal = {
      Global: Global,
      html: '' +
        '<div id="__modal__" class="modal">' +
        ' <div class="modal-content">' +
        '   <div class="modal-header">' +
        '     <span class="modal-close">&times;</span>' +
        '     <div class="modal-header-content"><!-- #confirmation --></div>' +
        '   </div>' +
        '   <div class="modal-body"><!-- #confirmation-message --></div>' +
        '   <div class="modal-footer">' +
        '     <button type="button" class="modal-ok"><!-- #ok --></button>' +
        '     <button type="button" class="modal-cancel"><!-- #cancel --></button>' +
        '   </div>' +
        '  </div>' +
        '</div>' +
        '',
      create: function (opts) {
        var G = this.Global;
        var m = {};
        opts = opts || {};
        m.opts = opts;
        m.opts.ok = m.opts.ok || {};
        m.opts.cancel = m.opts.cancel || {};

        var ph = document.createElement("div");
        m.placeholder = ph;
        m.opts.id = m.opts.id || G.rid();
        m.placeholder.innerHTML = this.html.replace('id="__modal__"', 'id="' + m.opts.id + '"');
        m.modal = ph.querySelector("#" + m.opts.id);

        m.header = ph.querySelector(".modal-header-content");
        m.header.innerHTML = m.opts.header || "<h2>" + G.getMsg(m.header.innerHTML) + "</h2>";

        m.body = ph.querySelector(".modal-body");
        m.body.innerHTML = m.opts.body || G.getMsg(m.body.innerHTML);

        m.okButton = ph.querySelector(".modal-ok");
        m.cancelButton = ph.querySelector(".modal-cancel");
        m.closeSpan = ph.querySelector(".modal-close");

        m.opts.ok.text = m.opts.ok.text || G.getMsg(m.okButton.innerHTML);
        m.okButton.textContent = m.opts.ok.text;

        m.opts.cancel.text = m.opts.cancel.text || G.getMsg(m.cancelButton.innerHTML);
        m.cancelButton.textContent = m.opts.cancel.text;

        m.open = function () {
          document.body.appendChild(this.placeholder);
          this.modal.style.display = "block";
          return this;
        };

        m.close = function () {
          this.modal.style.display = "none";
          this.destroy();
          return this;
        };

        m.destroy = function () {
          this.placeholder.parentNode.removeChild(this.placeholder);
          return this;
        };

        var okFun = (function (modal) {
          return function (event) {
            modal.close();
            if (modal.opts.ok.onclick) {
              modal.opts.ok.onclick.call(modal, event);
            }
          };
        })(m);

        var cancelFun = (function (modal) {
          return function (event) {
            modal.close();
            if (modal.opts.cancel.onclick) {
              modal.opts.cancel.onclick.call(modal, event);
            }
          };
        })(m);

        m.okButton.onclick = okFun;
        m.cancelButton.onclick = cancelFun;
        m.closeSpan.onclick = cancelFun;

        return m;
      }
    };

    Global.modal = modal;

    /********************************************************************************
     * snackbar
     */
    Global.snackbar = (function () {
      return function(selectors) {
        var self = Global.snackbar;
        self.html = '' +
        '<div class="snackbar">' +
        '  <div class="window-btn-belt contact text-right" style="height: 20px; padding-right: 8px; border-bottom: 1px solid #555;">' +
        '      <!-- https://fontawesome.com/icons?d=gallery&s=solid&m=free -->' +
        '      <div class="window-btn min ib bdr1 pad4 none">' +
        '          <i class="far fa-window-minimize"></i>' +
        '      </div>' +
        '      <div class="window-btn max ib bdr1 pad4 none">' +
        '          <i class="far fa-window-maximize"></i>' +
        '      </div>' +
        '      <div class="window-btn close ib bdr1 pad4 none">' +
        '          <i class="far fa-window-close"></i>' +
        '      </div>' +
        '  </div>' +
        '  <div class="belt message">' +
        '  </div>' +
        '</div>' +
        '';
  
        var elm = document.querySelector(selectors);
        elm.innerHTML = self.html;
        self.element = elm.querySelector(".snackbar");
        self.minBtn = self.element.querySelector(".window-btn.min");
        self.maxBtn = self.element.querySelector(".window-btn.max");
        self.closeBtn = self.element.querySelector(".window-btn.close");
        self.messageDiv = self.element.querySelector(".message");
        self.maximize = function() {
          self.minBtn.classList.remove("none");
          self.maxBtn.classList.add("none");
          // self.closeBtn.classList.remove("none");
          self.element.style.top = "calc(100% - " + self.element.clientHeight + "px)";
        };
        self.minimize = function() {
          self.minBtn.classList.add("none");
          self.maxBtn.classList.remove("none");
          // self.closeBtn.classList.remove("none");
          self.element.style.top = "calc(100% - " + self.element.querySelector(".window-btn-belt").clientHeight + "px";
        };
        self.close = function() {
          self.minBtn.classList.add("none");
          self.maxBtn.classList.add("none");
          self.closeBtn.classList.add("none");
          self.element.style.top = "calc(100% - " + self.element.querySelector(".window-btn-belt").clientHeight + "px";
        };
        elm.querySelector(".window-btn.min").addEventListener("click", self.minimize);
        elm.querySelector(".window-btn.max").addEventListener("click", self.maximize);
        elm.querySelector(".window-btn.close").addEventListener("click", self.close);
        return self;
      };
    })();

    return Global;
  })();
});