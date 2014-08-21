$(document).on "mousedown", "#camera.closed button.start", (event) -> camera.open()
$(document).on "mousedown", "#camera.open button.erase", -> camera.erase()

camera = window.camera =
  open: ->
    navigator.webkitGetUserMedia({video: true, audio: false}, camera.activate, camera.onerror)
    $(camera.element()).addClass("activating")
    if permittedToUseCamera is no
      $("#notice_request_to_use_camera").addClass("activated")

  onerror: (error) ->
    console.error("Camera stream error", error)
    $(camera.element()).removeClass("activating")
    $("#notice_request_to_use_camera").removeClass("activated")

  activate: (stream) ->
    camera.stream = stream
    $("#notice_request_to_use_camera").removeClass("activated")
    sessionStorage.setItem("permitted_to_use_camera", permittedToUseCameraURL)
    permittedToUseCamera = yes
    camera.videoElement().src = camera.videoURL()
    $(camera.videoElement()).one "playing", camera.activated

  activated: (event) ->
    $(camera.element()).removeClass("activating").addClass("activated")
    $("#camera #viewfinder").on "transitionend", (event) ->
      if event.propertyName is "opacity" and event.srcElement is $("#camera #viewfinder").get(0)
        $('#camera #viewfinder').off("transitionend")
        camera.opened(event)

  opened: (event) ->
    $(camera.element()).addClass("open").removeClass("closed")
    delay 1500, -> camera.startCountdown()

  startCountdown: ->
    $("#camera div.countdown a:nth-child(1)").addClass("current")
    delay 450, ->
      $("#camera div.countdown a:nth-child(1)").addClass("expired").removeClass("current")
      $("#camera div.countdown a:nth-child(2)").addClass("current")
      delay 450, ->
        $("#camera div.countdown a:nth-child(2)").addClass("expired").removeClass("current")
        $("#camera div.countdown a:nth-child(3)").addClass("current")
        delay 450, ->
          $("#camera div.countdown a:nth-child(3)").addClass("expired").removeClass("current")
          $("#camera div.countdown a:nth-child(3)").one "transitionend", camera.snap

  snap: (event) ->
    $(camera.element()).addClass("flash")
    $(camera.mediaTypeSelectElement()).prop("disabled", no)
    camera.canvasElement().getContext("2d").drawImage(camera.videoElement(), -40,0, 400,150)
    delay 10, -> camera.readImageBlob camera.save

  readImageBlob: (callback) ->
    camera.canvasElement().toBlob callback, camera.mediaType()

  save: (blob) ->
    camera.imageElement().src = URL.createObjectURL(blob)
    $(camera.imageElement()).one "load", camera.imageIsReady

  imageIsReady: (event) ->
    $(camera.element()).removeClass("activated flash").addClass("snapped")
    camera.stream.stop()
    delay 1500, -> $(camera.element()).trigger("camera:image_is_ready")

  erase: ->
    $(camera.element()).removeClass("snapped").addClass("erased")
    $('#camera div.countdown a').removeClass("expired")
    $(camera.mediaTypeSelectElement()).prop("disabled", yes)

    $("#camera #viewfinder").on "transitionend", (event) ->
      if event.propertyName is "opacity" and event.srcElement is $("#camera #viewfinder").get(0)
        $('#camera #viewfinder').off("transitionend")
        camera.closed(event)

  closed: (event) ->
    $(camera.element()).removeClass("erased open").addClass("closed")
    $(camera.element()).trigger("camera:closed")

  videoURL: ->
    window.webkitURL.createObjectURL(camera.stream) if camera.stream

  mediaType: ->
    $(camera.mediaTypeSelectElement()).val()

  element: ->
    element = $("#camera").get(0)
    (camera.element = -> element)()

  canvasElement: ->
    canvasElement = $("<canvas>").get(0)
    (camera.canvasElement = -> canvasElement)()

  imageElement: ->
    imageElement = $("#camera img.snap").get(0)
    (camera.imageElement = -> imageElement)()

  videoElement: ->
    videoElement = $("#camera video").get(0)
    (camera.videoElement = -> videoElement)()

  mediaTypeSelectElement: ->
    selectElement = $('#input_files div.unencrypted.image [name=type]').get(0)
    (camera.selectElement = -> selectElement)()




permittedToUseCameraURL = window.location.toString().split("#")[0]
permittedToUseCamera = sessionStorage.getItem("permitted_to_use_camera") is permittedToUseCameraURL
console.info("permittedToUseCamera", sessionStorage.getItem("permitted_to_use_camera"))
console.info("permittedToUseCamera", permittedToUseCamera)
sessionStorage.setItem("permitted_to_use_camera", "undefined")

delay = (amount, func) -> setTimeout func, amount
