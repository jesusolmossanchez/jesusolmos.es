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

    empieza_todo();
    $(document.body).on('click','.contiene_proyecto', function(e) {
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

    $(".con_video").hover(hoverVideo, hideVideo);



});


var renderer;

function empieza_todo(){

    $("html, body, #contenedor").css({ height: $(window).height() });


    window.setTimeout(function () {
        $("#contenedor_loader").addClass("activo");
        $("#loader").addClass("activo");
    }, 1000);

    window.setTimeout(function () {
        $("#fondo_negro").fadeOut(1000);
        $("#trabajos_link").addClass("activo");

        var hiddenHtml = `
        <div id="left" class="bloque_oblicuo">
            <div class="inner_bloque_oblicuo">
                <div class="contiene_proyecto shck">
                    <div class="bg_proyecto"></div>
                    <p>
                        Jumanji Running - SONY
                        <br/><br/>Hybrid app for iOS and Android
                        <span class="texto_extra">
                            <br/>'Running app' with geolocation and gamification
                            <br/>Made with cordova using no other JS framework
                            <br/>Agency: Shackleton
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/jumanji.jpg">
                    <div class="bloque_extra">
                        <img loading="lazy" src="imagenes/jumanji2.jpg">
                        <img loading="lazy" src="imagenes/jumanji3.png">
                        <img loading="lazy" src="imagenes/jumanji4.jpg">
                        <img loading="lazy" src="imagenes/jumanji5.jpg">
                        <img loading="lazy" src="imagenes/jumanji6.jpg">
                    </div>
                </div>
                
                <div class="contiene_proyecto personal">
                    <div class="bg_proyecto"></div>
                    <p>
                        __Off_the_line__
                        <br/>
                        <br/>HTML5 PWA web game
                        <br/>
                        <br/>TWA Android APP
                        <span class="texto_extra">
                            <br/>
                            <br/>Less than 13kbs in plain javascript
                            <br/>js13kgames Contest
                            <br/>
                            <a target="_blank" href="https://offtheline.jesusolmos.es/">link</a>
                            <a target="_blank" href="https://play.google.com/store/apps/details?id=com.jesusolmos.lostangry">
                                <img style="width: 150px; display: block; margin: 30px 0;" src="imagenes/gp_icon.png" alt="app_link">
                            </a>
                        </span>
                    </p>
                    <div class="bloque_extra">
                        <img loading="lazy" src="imagenes/offtheline_gif1.gif">
                        <img loading="lazy" src="imagenes/offtheline2.png">
                        <img loading="lazy" src="imagenes/offtheline3.png">
                        <img loading="lazy" src="imagenes/offtheline_gif2.gif">
                    </div>
                    <img loading="lazy" src="imagenes/offtheline1.jpg">
                </div>
                <div class="contiene_proyecto personal con_video">
                    <div class="bg_proyecto"></div>
                    <p>
                        Lost and Angry
                        <br/>
                        <br/>HTML5 PWA web game
                        <br/>
                        <br/>TWA Android APP
                        <span class="texto_extra">
                            <br/>
                            <br/>Less than 13kbs in plain javascript
                            <br/>js13kgames Contest
                            <br/>
                            <a href="https://lost-angry.jesusolmos.es/" target="_blank">link</a>
                            <a href="https://play.google.com/store/apps/details?id=com.jesusolmos.lostangry" target="_blank">
                                <img style="width: 150px; display: block; margin: 30px 0;" src="imagenes/gp_icon.png" alt="app_link">
                            </a>
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/lost_angry.jpg">
                    <div class="contiene_video">
                        <video loop>
                            <source src="videos/lost_and_angry.mp4" type="video/mp4">
                        </video>
                    </div>
                </div>
                <div class="contiene_proyecto shck con_video">
                    <div class="bg_proyecto"></div>
                    <p>
                        Superpoderes - ABANCA
                        <br/>
                        <br/>Corporative webpage
                        <span class="texto_extra">
                            <br/>LAMP enviroment with CSS3 animations
                            <br/>Agency: Shackleton
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/superpoderes.jpg">
                    <div class="contiene_video">
                        <video loop>
                            <source src="videos/abanca_super.mp4" type="video/mp4">
                        </video>
                    </div>
                    <div class="bloque_extra">
                        <img loading="lazy" src="imagenes/superpoderes2.jpg">
                    </div>
                </div>
                
                <div class="contiene_proyecto shck" style="background: #000;">
                    <div class="bg_proyecto"></div>
                    <p>
                        Sound and Grow - HEINZ
                        <br/><br/>Hybrid app for iOS and Android
                        <span class="texto_extra">
                            <br/>'Educational app' With geolocation and wheater prediction
                            <br/>Made with cordova using onsen framework
                            <br/>MySQL and PHP backend
                            <br/>Agency: Shackleton
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/sound_grow.jpg">
                    <div class="bloque_extra">
                        <img loading="lazy" src="imagenes/sound_grow2.jpg">
                        <iframe src="https://www.youtube.com/embed/4gDz4QFOPrI?rel=0" frameborder="0" allowfullscreen=""></iframe>
                        <img loading="lazy" src="imagenes/sound_grow3.jpg">
                    </div>
                </div>
                <div class="contiene_proyecto okn" style="background: #000;">
                    <div class="bg_proyecto"></div>
                    <p>
                        OKN learning
                        <br/><br/>E-learning environment for business
                        <span class="texto_extra">
                            <br/>Made with PHP over Azure distributed architecture
                            <br/>MariaDB database with Propel ORM
                            <br/>Being part of a great team of developers
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/okn1.png">
                    <div class="bloque_extra">
                        <img loading="lazy" src="imagenes/okn2.png">
                        <img loading="lazy" src="imagenes/okn3.png">
                        <img loading="lazy" src="imagenes/okn4.png">
                        <img loading="lazy" src="imagenes/okn5.png">
                        <img loading="lazy" src="imagenes/okn6.png">
                    </div>
                </div>
                
                <div class="contiene_proyecto personal con_video">
                    <div class="bg_proyecto"></div>
                    <p>
                        Dudevolley
                        <br/><br/>HTML5 web game
                        <span class="texto_extra">
                            <br/>Made with PhaserJS framework
                            <br/>NodeJS and MongoDB backend
                            <br/>Implements multiplayer mode through websocket
                            <br/><a target="_blank" href="https://www.dudevolley.com">www.dudevolley.com</a> 
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/dudevolley.png">
                    <div class="contiene_video">
                        <video loop>
                            <source src="videos/dude.mp4" type="video/mp4">
                        </video>
                    </div>
                </div>
                <div class="contiene_proyecto personal">
                    <div class="bg_proyecto"></div>
                    <p>
                        Sockies
                        <br/><br/>E-commerce web made with Prestashop
                        <span class="texto_extra">
                            <br/>www.sockies.es
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/sockies.jpg">
                </div>
                <div class="contiene_proyecto personal">
                    <div class="bg_proyecto"></div>
                    <p>
                        Cyprea
                        <br/><br/>E-commerce web made with Prestashop
                        <span class="texto_extra">
                            <br/>www.cyprea.es
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/cyprea.jpg">
                </div>
                <div class="contiene_proyecto personal con_video" style="background:#cecece">
                    <div class="bg_proyecto"></div>
                    <p>
                        DIKTIA
                        <br/><br/>Corporative webpage (under construction)
                        <span class="texto_extra">
                            <br/><a target="_blank" href="http://www.diktia.com">www.diktia.com</a> 
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/32.png">
                    <div class="contiene_video">
                        <video loop>
                            <source src="videos/diktia.mp4" type="video/mp4">
                        </video>
                    </div>
                </div>
                <div class="contiene_proyecto shck con_video">
                    <div class="bg_proyecto"></div>
                    <p>
                        Piensa sin prejuicios - P.P.
                        <br/><br/>HTML5 quiz game
                        <span class="texto_extra">
                            <br/>Made in plain JS
                            <br/>Agency: Shackleton
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/piensa_sin_prejuicios.jpg">
                    <div class="contiene_video">
                        <video loop>
                            <source src="videos/pp_game.mp4" type="video/mp4">
                        </video>
                    </div>
                </div>
                <div class="contiene_proyecto shck" style="display:none">
                    <div class="bg_proyecto"></div>
                    <p>
                        Desarrollo Web
                        <br/>Campaña ACH
                        <br/>Shot in 2016
                        <br/>Agency: Shackleton
                    </p>
                    <img loading="lazy" src="imagenes/shotin20016.jpg">
                </div>
                <div class="contiene_proyecto shck con_video">
                    <div class="bg_proyecto"></div>
                    <p>
                        Monsters Off
                        <br/><br/>Corporative webpage
                        <span class="texto_extra">
                            <br/>LAMP enviroment
                            <br/>Agency: Shackleton
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/monster_off.png">
                    <div class="contiene_video">
                        <video loop>
                            <source src="videos/monster_off.mp4" type="video/mp4">
                        </video>
                    </div>
                </div>
                <div class="contiene_proyecto shck con_video">
                    <div class="bg_proyecto"></div>
                    <p>
                        Qué hacen los gastos - ABANCA
                        <br/><br/>Corporative webpage
                        <span class="texto_extra">
                            <br/>LAMP enviroment with CSS3 animations
                            <br/>Agency: Shackleton
                        </span>
                    </p>
                    <img loading="lazy" src="imagenes/los_gastos.jpg">
                    <div class="contiene_video">
                        <video loop>
                            <source src="videos/gastos.mp4" type="video/mp4">
                        </video>
                    </div>
                </div>
            </div>
        </div>
        <div id="right"  class="bloque_oblicuo">
            <div class="inner_bloque_oblicuo">
                <br/>
                <br/>
                I'm a web developer based in Spain.<br/> <br/> 
                I love creating innovative experiences<br/> 
                for the web, using every time the tools I need.<br/>
                Javascript, CSS, PHP, NodeJS, MySQL, MongoDB...
                <br/>
                <br/>
                Social Fingerprint:
                <br/>
                <br/>
                <div id="sociales">
                    <a href="https://es.linkedin.com/in/jesusolmossanchez" target="_blank">
                        <img loading="lazy" src="imagenes/linkedin.png">
                    </a>
                    <a href="https://stackoverflow.com/users/5506301/jolmos" target="_blank">
                        <img loading="lazy" src="imagenes/stackoverflow.png">
                    </a>
                    <a href="https://github.com/jesusolmossanchez" target="_blank">
                        <img loading="lazy" src="imagenes/github.png">
                    </a>
                </div>
                <br/>
                <a href="mailto:jesusolmossanchez@gmail.com">Say Hello!</a>
            </div>
        </div>`;

        $("#trabajos").append(hiddenHtml);
    }, 4500);






    /*******************************************************************/
    /*******************************************************************/
    /*******************************************************************/
    /***************************** IMAGE!!! ****************************/
    /*******************************************************************/
    /*******************************************************************/
    /*******************************************************************/
    var rand = Math.floor(Math.random()*25)
    //var img = './src/img/imagen_00'+rand+'.jpg';
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
    renderer = new GlRenderer(canvas, vertices, true, img, function () {
        //renderTime(start);
    });
}

window.addEventListener("resize", function() {
        
    empieza_todo();

}, false);

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