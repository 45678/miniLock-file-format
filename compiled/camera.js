(function() {
  var camera, delay, permittedToUseCamera, permittedToUseCameraURL;

  $(document).on("mousedown", "#camera.closed button.start", function(event) {
    return camera.open();
  });

  $(document).on("mousedown", "#camera.open button.erase", function() {
    return camera.erase();
  });

  camera = window.camera = {
    open: function() {
      navigator.webkitGetUserMedia({
        video: true,
        audio: false
      }, camera.activate, camera.onerror);
      $(camera.element()).addClass("activating");
      if (permittedToUseCamera === false) {
        return $("#notice_request_to_use_camera").addClass("activated");
      }
    },
    onerror: function(error) {
      console.error("Camera stream error", error);
      $(camera.element()).removeClass("activating");
      return $("#notice_request_to_use_camera").removeClass("activated");
    },
    activate: function(stream) {
      var permittedToUseCamera;
      camera.stream = stream;
      $("#notice_request_to_use_camera").removeClass("activated");
      sessionStorage.setItem("permitted_to_use_camera", permittedToUseCameraURL);
      permittedToUseCamera = true;
      camera.videoElement().src = camera.videoURL();
      return $(camera.videoElement()).one("playing", camera.activated);
    },
    activated: function(event) {
      $(camera.element()).removeClass("activating").addClass("activated");
      return $("#camera #viewfinder").on("transitionend", function(event) {
        if (event.propertyName === "opacity" && event.srcElement === $("#camera #viewfinder").get(0)) {
          $('#camera #viewfinder').off("transitionend");
          return camera.opened(event);
        }
      });
    },
    opened: function(event) {
      $(camera.element()).addClass("open").removeClass("closed");
      return delay(1500, function() {
        return camera.startCountdown();
      });
    },
    startCountdown: function() {
      $("#camera div.countdown a:nth-child(1)").addClass("current");
      return delay(450, function() {
        $("#camera div.countdown a:nth-child(1)").addClass("expired").removeClass("current");
        $("#camera div.countdown a:nth-child(2)").addClass("current");
        return delay(450, function() {
          $("#camera div.countdown a:nth-child(2)").addClass("expired").removeClass("current");
          $("#camera div.countdown a:nth-child(3)").addClass("current");
          return delay(450, function() {
            $("#camera div.countdown a:nth-child(3)").addClass("expired").removeClass("current");
            return $("#camera div.countdown a:nth-child(3)").one("transitionend", camera.snap);
          });
        });
      });
    },
    snap: function(event) {
      $(camera.element()).addClass("flash");
      $(camera.mediaTypeSelectElement()).prop("disabled", false);
      camera.canvasElement().getContext("2d").drawImage(camera.videoElement(), -40, 0, 400, 150);
      return delay(10, function() {
        return camera.readImageBlob(camera.save);
      });
    },
    readImageBlob: function(callback) {
      return camera.canvasElement().toBlob(callback, camera.mediaType());
    },
    save: function(blob) {
      camera.imageElement().src = URL.createObjectURL(blob);
      return $(camera.imageElement()).one("load", camera.imageIsReady);
    },
    imageIsReady: function(event) {
      $(camera.element()).removeClass("activated flash").addClass("snapped");
      camera.stream.stop();
      return delay(1500, function() {
        return $(camera.element()).trigger("camera:image_is_ready");
      });
    },
    erase: function() {
      $(camera.element()).removeClass("snapped").addClass("erased");
      $('#camera div.countdown a').removeClass("expired");
      $(camera.mediaTypeSelectElement()).prop("disabled", true);
      return $("#camera #viewfinder").on("transitionend", function(event) {
        if (event.propertyName === "opacity" && event.srcElement === $("#camera #viewfinder").get(0)) {
          $('#camera #viewfinder').off("transitionend");
          return camera.closed(event);
        }
      });
    },
    closed: function(event) {
      $(camera.element()).removeClass("erased open").addClass("closed");
      return $(camera.element()).trigger("camera:closed");
    },
    videoURL: function() {
      if (camera.stream) {
        return window.webkitURL.createObjectURL(camera.stream);
      }
    },
    mediaType: function() {
      return $(camera.mediaTypeSelectElement()).val();
    },
    element: function() {
      var element;
      element = $("#camera").get(0);
      return (camera.element = function() {
        return element;
      })();
    },
    canvasElement: function() {
      var canvasElement;
      canvasElement = $("<canvas>").get(0);
      return (camera.canvasElement = function() {
        return canvasElement;
      })();
    },
    imageElement: function() {
      var imageElement;
      imageElement = $("#camera img.snap").get(0);
      return (camera.imageElement = function() {
        return imageElement;
      })();
    },
    videoElement: function() {
      var videoElement;
      videoElement = $("#camera video").get(0);
      return (camera.videoElement = function() {
        return videoElement;
      })();
    },
    mediaTypeSelectElement: function() {
      var selectElement;
      selectElement = $('#input_files div.unencrypted.image [name=type]').get(0);
      return (camera.selectElement = function() {
        return selectElement;
      })();
    }
  };

  permittedToUseCameraURL = window.location.toString().split("#")[0];

  permittedToUseCamera = sessionStorage.getItem("permitted_to_use_camera") === permittedToUseCameraURL;

  console.info("permittedToUseCamera", sessionStorage.getItem("permitted_to_use_camera"));

  console.info("permittedToUseCamera", permittedToUseCamera);

  sessionStorage.setItem("permitted_to_use_camera", "undefined");

  delay = function(amount, func) {
    return setTimeout(func, amount);
  };

}).call(this);
