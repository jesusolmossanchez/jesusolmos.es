var contenedor = document.getElementById("contenedor_loader");
window.mouse = (function () {
    function preventDefault(e) { e.preventDefault(); }
    var m;
    var mouse = {
        x: 0, y: 0, w: 0,
        alt: false, shift: false, ctrl: false,
        buttonRaw: 0,
        over: false,
        buttonOnMasks: [0b1, 0b10, 0b100],
        buttonOffMasks: [0b110, 0b101, 0b011],
        active: false,
        bounds: null,
        eventNames: "touchmove,mousemove,mousedown,mouseup,mouseout,mouseover".split(","),
        event(e) {
            var t = e.type;
            m.bounds = m.element.getBoundingClientRect();
            var touch;
            if (e.touches) {
                touch = e.touches[0];
            }
            m.x = (e.pageX || touch.pageX) - m.bounds.left;
            m.y = (e.pageY || touch.pageY) - m.bounds.top;
            m.alt = e.altKey;
            m.shift = e.shiftKey;
            m.ctrl = e.ctrlKey;
            if (t === "mousedown") {
                m.buttonRaw |= m.buttonOnMasks[e.which - 1];
            }
            else if (t === "mouseup") {
                m.buttonRaw &= m.buttonOffMasks[e.which - 1];
            }
            else if (t === "mouseout") {
                m.over = false;
            }
            else if (t === "mouseover") {
                m.over = true;
            }
            //else if (t === "mousewheel") { m.w = e.wheelDelta }
            //else if (t === "DOMMouseScroll") { m.w = -e.detail }
            if (m.callbacks) {
                m.callbacks.forEach(c => c(e)); 
            }
            if ((m.buttonRaw & 2) && m.crashRecover !== null) {
                if (typeof m.crashRecover === "function") {
                    setTimeout(m.crashRecover, 0);
                }
            }
            e.preventDefault();
        },
        addCallback(callback) {
            if (typeof callback === "function") {
                if (m.callbacks === undefined) {
                    m.callbacks = [callback];
                }
                else {
                    m.callbacks.push(callback);
                }
            }
        },
        start(element) {
            if (m.element !== undefined) { m.remove() }
            m.element = element === undefined ? document : element;
            m.eventNames.forEach(name => document.addEventListener(name, mouse.event));
            //document.addEventListener("contextmenu", preventDefault, false);
            m.active = true;
        },
        remove() {
            if (m.element !== undefined) {
                m.eventNames.forEach(name => document.removeEventListener(name, mouse.event));
                //document.removeEventListener("contextmenu", preventDefault);
                m.element = m.callbacks = undefined;
                m.active = false;
            }
        }

    }
    m = mouse;
    return mouse;
})();

var canvas = document.getElementById("canvas");
var contenedor_loader = document.getElementById("contenedor_loader");
mouse.start(contenedor_loader, true);


$(document).ready(function () {

    $("html, body, #contenedor").css({ height: $(window).height() });


    window.setTimeout(function () {
        $("#contenedor_loader").addClass("activo");
        $("#loader").addClass("activo");
    }, 1000);

    window.setTimeout(function () {
        $("#fondo_negro").fadeOut(1000);
        $("#trabajos_link").addClass("activo");

    }, 4500);

    $(".contiene_proyecto").click(function () {
        $(".contiene_proyecto").addClass("abierto_otro");
        $(this).addClass("abierto");
        var que_oblicuo = $(this).closest(".bloque_oblicuo");
        var oblicuo_id = que_oblicuo.attr("id");
        if (oblicuo_id === "left") {
            que_oblicuo.addClass("activo");
            que_oblicuo.addClass("pre_post_activo");
            $("#cerrar_bloque").removeClass("izquierda");
            $("#cerrar_bloque").addClass("derecha");
            $("#cerrar_bloque").addClass("activo");
        }
        $(this).find(".texto_extra").show();
        $("#cerrar_bloque #texto_explica").html($(this).find("p").html());

        que_oblicuo.find(".inner_bloque_oblicuo").animate({ scrollTop: 0 }, 500, 'linear');


        if ($(this).hasClass("con_video")) {
            $(this).find("video")[0].play();
            $(this).find("video").eq(0).css("opacity", 1);
        }

        if ($(window).width() <= 480 && $(window).height() <= 813){
            var alto_explica = $("#cerrar_bloque").height();
            $(this).css("padding-top", alto_explica+"px");
        }

    });

    $("#trabajos_link").click(function (e) {
        e.preventDefault();
        $(".bloque_oblicuo").addClass("cargadas");
        $("#bloque_links").addClass("con_borde");
        $("#trabajos").addClass("activo");
        $("#right").addClass("out");
        $("#left").removeClass("out");

        $("#corte").addClass("out");
    });

    $("#mi_nombre").click(function (e) {
        e.preventDefault();
        
        $(".bloque_oblicuo").addClass("cargadas");
        $("#bloque_links").addClass("con_borde");
        $("#trabajos").addClass("activo");
        $("#left").addClass("out");
        $("#left").removeClass("activo");

        $("#cerrar_bloque #texto_explica").html("");
        $(".contiene_proyecto").removeClass("abierto_otro");
        $(".contiene_proyecto").removeClass("abierto");
        $(".contiene_proyecto").css("padding-top", "");
        $(".texto_extra").hide();

        $("#cerrar_bloque").removeClass("activo");
        $("#right").removeClass("out");
        
        $("#corte").addClass("out");
    });

    $("#cerrar").click(function (e) {
        e.preventDefault();
        $(this).parent().removeClass("activo");
        $("#left, #right").removeClass("activo");
        window.setTimeout(function () {
            $("#left, #right").removeClass("pre_post_activo");
        }, 1001);

        $("#cerrar_bloque #texto_explica").html("");
        $(".contiene_proyecto").removeClass("abierto_otro");
        $(".contiene_proyecto").removeClass("abierto");
        $(".contiene_proyecto").css("padding-top", "");
        $(".texto_extra").hide();
    });

    var over_largo;
    $(".con_video").hover(hoverVideo, hideVideo);

    function hoverVideo(e) {
        //console.log(e);
        //console.log(this);
        if($(this).hasClass("abierto")){
            return;
        }
        var self = this;
        over_largo = setTimeout(function () {
            $(self).find("video")[0].play();
            $(self).find("video").eq(0).css("opacity", 1);
        }, 1000);
    }

    function hideVideo(e) {
        if ($(this).hasClass("abierto")) {
            return;
        }
        clearTimeout(over_largo);
        $(this).find("video")[0].pause();
        $(this).find("video").eq(0).css("opacity", 0);
    }




    /*******************************************************************/
    /*******************************************************************/
    /*******************************************************************/
    /***************************** IMAGE!!! ****************************/
    /*******************************************************************/
    /*******************************************************************/
    /*******************************************************************/
    var rand = Math.floor(Math.random()*25)
    var img = './src/img/imagen_00'+rand+'.jpg';
    var img = './dist/src/img/yo.jpg';

    var fake_img = new Image();

    fake_img.onload = function () {
        var height = fake_img.height;
        var width = fake_img.width;

        if(width > height){

            $("#inner_corte").addClass("imagen_ancha");
        }

        // code here to use the dimensions
    }
    fake_img.src = img;


    $("#imagen_normal").css("background-image","url("+img+")");
    $("#inner_corte").css("background-image","url("+img+")");

    //var img = './src/img/logo.jpg';
    var canvas = document.getElementById('canvas');

    // init canvas width to that of window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var vertices = window.innerWidth / 2;

    vertices = 650;

    if (window.innerWidth < 700) {
        vertices = 450;
    }


    $("#inner_corte").height(canvas.height);
    $("#imagen_normal").height(canvas.height);
    var renderer = new GlRenderer(canvas, vertices, true, img, function () {
        //renderTime(start);
    });


    window.addEventListener("resize", function() {
        
        $("html, body, #contenedor").css({ height: $(window).height() });
        
        if (this.window.innerWidth > 700) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            renderer.resize();
            rerender();
        }
        
    
    }, false);
    


    function rerender() {

        var vertices = window.innerWidth / 2;
        
        vertices = 650;
        if (window.innerWidth < 700) {
            vertices = 450;
        }
        $("#inner_corte").height(canvas.height);
        $("#imagen_normal").height(canvas.height);
        renderer = new GlRenderer(canvas, vertices, true, img, function () {
            //renderTime(start);
        });
    }


});
