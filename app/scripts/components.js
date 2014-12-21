"use strict";

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

window.BL = {};

BL.Center = function (el) {
    $("html, body").animate({
        scrollTop: $(el).offset().top - (( $(window).height() - $(this).outerHeight(true) ) / 2),
        scrollLeft: $(el).offset().left - (( $(window).width() - $(this).outerWidth(true) ) / 2)
    }, 200);
};

BL.DomRenderer = function (entity, innerHTML) {
    if (entity.el !== undefined) {
        document.getElementById("entityboard").removeChild(entity.el);
    }
    var div = document.createElement("div");
    div.innerHTML = innerHTML;
    div.className = "entity " + entity.kind;
    div.style.left = entity.position.x + "em";
    div.style.top = entity.position.y + "em";
    entity.el = div;

    entity.move = function (deltaX, deltaY, entity) {
        entity.el.style.top = entity.position.y + "em"; //e.data.entity.position.y + "em";
        entity.el.style.left = entity.position.x + "em";
        if (entity.data.entity.kind === "player") {
            $("html,body").animate({
                scrollTop: document.body.scrollTop + deltaY * 16,//e.data.deltas.deltaY * 16,
                scrollLeft: document.body.scrollLeft + deltaX * 16
            }, 200);
        }
    };

    entity.die = function () {
        document.getElementById("entityboard").removeChild(entity.el);
    };

    entity.el = document.getElementById("entityboard").appendChild(entity.el);
    if (entity.kind === "player") {
        BL.Center(entity.el);
    }
    entity.trigger("rendered", entity);
};

BL.CanvasRenderer = function(entity) {
    var square = 24;

    //rendering position needs to be offset but current player position (or canvas viewport if you want to think about it that way);
    entity.draw = function (context) {//figure out the animated move part later

        var step = 4;
        if (Math.abs(entity._position.x - entity.position.x) > 2 || Math.abs(entity._position.y - entity.position.y) > 2) {
            entity.position.x = entity._position.x;
            entity.position.y = entity._position.y;
        } else {
            if (!Math.abs(entity._position.x - entity.position.x) / step < 0.01) {
                entity.position.x = (entity.position.x + (entity._position.x - entity.position.x) / step);
                if (entity.kind === "player") {
                    BL.Viewport.x = entity.position.x;
                }
            }
            if (!Math.abs(entity._position.y - entity.position.y) / step < 0.01) {
                entity.position.y = (entity.position.y + (entity._position.y - entity.position.y) / step);
                if (entity.kind === "player") {
                    BL.Viewport.y = entity.position.y;
                }
            }
        }

        var posX = (entity.position.x - (BL.Viewport.x - ((context.canvas.width / 2) / square))) * square;
        var posY = (entity.position.y - (BL.Viewport.y - ((context.canvas.height / 2) / square))) * square;
        context.globalAlpha = 1;

        if (entity.kind === "block") {
            context.shadowOffsetY = (-(entity.position.y - BL.Viewport.y)/12)+5;
            context.shadowOffsetX = -(entity.position.x - BL.Viewport.x)/3;
            context.shadowBlur = 4;
            context.shadowColor = "rgba(255,255,255,0.4)";
            context.strokeStyle="red";

            context.fillStyle = "rgba(200,200,200,0.4)";
            context.fillRect(posX+0.5, posY+0.5, square+0.5, square+0.5);
        } else {
            context.shadowColor = "transparent";
            context.drawImage(BL.Sprites[entity.icon], posX+0.5, posY+0.5, square+0.5, square+0.5);
            var posOffX = posX - ((entity.position.x - BL.Viewport.x)/3)+0.5;
            var posOffY = posY - ((entity.position.y - BL.Viewport.y)/12)+4;
            //context.drawImage(BL.Sprites[entity.icon], posOffX, posOffY, square+0.5, square+0.5);
        }

    };

    entity.move = function (/*deltaX, deltaY, entity*/) {
    };

    entity.die = function () {
    };
};

BL.MoveControllerComponent = function (entity) {
    //requires the BL.MoveComponent
    document.body.addEventListener("keydown", function keydown(event) {
        if (!entity.dead) {
            switch (event.which) {
                //left
                case 37:
                case 65:
                    //event.preventDefault();
                    //// entity.move(-1, 0);
                    //break;
                //down
                case 40:
                case 83:
                    //event.preventDefault();
                    //// entity.move(0, 1);
                    ////right
                    //break;
                case 39:
                case 68:
                    //event.preventDefault();
                    //// entity.move(1, 0);
                    //break;
                //up
                case 38:
                case 87:
                    event.preventDefault();
                    // entity.move(0, -1);
                    break;
            }
        }

    }, false);

    document.body.addEventListener("keyup", function keyUp(event) {
        if (!entity.dead) {
            switch (event.which) {
                //left
                case 37:
                case 65:
                    event.preventDefault();
                    entity.move(-1, 0);
                    break;
                //down
                case 40:
                case 83:
                    event.preventDefault();
                    entity.move(0, 1);
                    //right
                    break;
                case 39:
                case 68:
                    event.preventDefault();
                    entity.move(1, 0);
                    break;
                //up
                case 38:
                case 87:
                    event.preventDefault();
                    entity.move(0, -1);
                    break;
                case 32:
                    event.preventDefault();
                    BL.Center(entity.display.el);
                    break;
            }
        }
    }, false);


    document.body.addEventListener("touchend", function dblClick(event) {
        if (!entity.dead) {
            var touch = event.changedTouches[0];

            event.preventDefault();

            var x = 0, y = 0;
            var center = {
                x: document.body.clientWidth / 2,
                y: document.body.clientHeight / 2
            };

            if (Math.abs(center.x - touch.clientX) > Math.abs(center.y - touch.clientY)) {
                if (0 < center.x - touch.clientX) {
                    x = -1;
                } else if (0 > center.x - touch.clientX) {
                    x = 1;
                }

            } else {
                if (0 < center.y - touch.clientY) {
                    y = -1;
                } else if (0 > center.y - touch.clientY) {
                    y = 1;
                }
            }
            entity.move(x, y);
        }
        entity.pulling(false);
    }, false);
};

BL.PullControllerComponent = function (entity) {
    //move all this to the controller components
    entity.pulling(false);
    document.body.addEventListener("keydown", function keydown(event) {
        if (event.which === 16 && !entity.dead) {
            event.preventDefault();
            entity.pulling(true);
        }
    }, false);
    document.body.addEventListener("keyup", function keyup(event) {
        if (event.which === 16 && !entity.dead) {
            event.preventDefault();
            entity.pulling(false);
        }
    });
    document.body.addEventListener("touchmove", function (/*event*/) {
        entity.pulling(true);
    });
};
