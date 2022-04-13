$(document).ready(function () {
  var file_url = getUrlVars()["file"];
  launchAR();

  // Get the URL & Params, Break them Down
  function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(
      /[?&]+([^=&]+)=([^&]*)/gi,
      function (m, key, value) {
        vars[key] = value;
      }
    );
    return vars;
  }
  function isIOS() {
    return (
      (/iPad|iPhone|iPod/.test(navigator.userAgent) && !self.MSStream) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }

  function launchAR() {
    if (isIOS()) {
      openIOSARQuickLook();
    } else {
      openSceneViewer();
    }
  }

  function openIOSARQuickLook() {
    const file_url = getUrlVars()["file"];
    const anchor = document.createElement("a");
    anchor.setAttribute("rel", "ar");
    anchor.appendChild(document.createElement("img"));

    const usdzUrl = file_url + "#allowsContentScaling=0";
    anchor.setAttribute("href", usdzUrl);
    console.log("Launching iOS QuickLook: " + usdzUrl);
    anchor.click();
  }

  function createAndroidIntent() {
    const file_url = getUrlVars()["file"];
    // This is necessary because the original URL might have query
    // parameters. Since we're appending the whole URL as query parameter,
    // ? needs to be turned into & to not lose any of them.
    const gltfSrc = file_url;
    const location = self.location.toString();
    const locationUrl = new URL(location);
    const cleanUrl = new URL(gltfSrc, location);

    // modelUrl can contain title/link/sound etc.
    // These are already URL-encoded, so we shouldn't do that again here.
    let intentParams = `?file=${cleanUrl.toString()}&mode=ar_only`;

    // if (!gltfSrc.includes("&link=")) {
    //   intentParams += `&link=${location}`;
    // }
    // if (!gltfSrc.includes("&title=")) {
    // 	intentParams += `&title=${encodeURIComponent(this.alt || "")}`;
    // }
    intentParams += `&resizable=false`;

    const intent = `intent://arvr.google.com/scene-viewer/1.0${intentParams}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
      locationUrl.toString()
    )};end;`;

    return intent;
  }

  function openSceneViewer(customIntent = "") {
    const anchor = document.createElement("a");
    const noArViewerSigil = "#model-viewer-no-ar-fallback";
    let fallbackInvoked = false;

    if (fallbackInvoked) {
      return;
    }

    const intent = createAndroidIntent();

    const handleFallback = () => {
      if (self.location.hash === noArViewerSigil && !fallbackInvoked) {
        fallbackInvoked = true;
        // The new history will be the current URL with a new hash.
        // Go back one step so that we reset to the expected URL.
        // NOTE(cdata): this should not invoke any browser-level navigation
        // because hash-only changes modify the URL in-place without
        // navigating:
        self.history.back();
      }
    };

    document.addEventListener("hashchange", handleFallback, { once: true });
    console.log("Launching Android Intent: " + intent);
    anchor.setAttribute("href", intent);
    anchor.click();
  }
});
