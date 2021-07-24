//Aliases
const Application = PIXI.Application,
    Container = PIXI.Container,
    Graphics = PIXI.Graphics,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Camera3d = PIXI.projection.Camera3d,
    Container3d = PIXI.projection.Container3d,
    Sprite3d = PIXI.projection.Sprite3d

const Tool = function () {
    return {
        randomPosive: function () {
            return Math.random() * 2 < 1 ? 1 : -1
        }
    }
}()

const UIController = function (tool) {
    let width = (window.innerWidth > 0) ? window.innerWidth-1 : screen.width-1
    let height = (window.innerHeight > 0) ? window.innerHeight-1 : screen.height-1
    let scale = 1000/width
    let app, camera, loader, imgs, player, monsters, floors, dungeon, startMsg, overMsg, scoreMsg
    let loaded = false
    let now = new Date().getTime()
    let countDownTime = 3
    let canStart = false
    let countTime = 0
    let gameOver = false
    let gameOverSecond = 0
    const MONSTER_COUNT = 500

    function initApp() {
        document.body.innerHTML = ""
        width = (window.innerWidth > 0) ? window.innerWidth-1 : screen.width-1
        height = (window.innerHeight > 0) ? window.innerHeight-1 : screen.height-1
        app = new Application({
            width: width,
            height: height,
            antialiasing: true,
            transparent: false,
            resolution: 1
        })
        loader = app.loader
        document.body.appendChild(app.view)
        loader.add("treasureHunter", "img/treasureHunter.json")
            .load(initMain)
    }

    function initParam() {
        loaded = false
        now = new Date().getTime()
        countDownTime = 3
        canStart = false
        countTime = 0
        gameOver = false
        gameOverSecond = 0
    }


    function initMain(loaderInstance, res) {
        imgs = res.treasureHunter.textures
        initParam()
        initCamera()
        initBGLayer()
        initPlayerLayer()
        initMonsterLayer()
        initPanelLayer()
        loaded = true
    }

    function initCamera() {
        camera = new Camera3d()
        camera.setPlanes(width, 10, height, false)
        camera.position.set(app.screen.width / 2, app.screen.height / 2)
        app.stage.addChild(camera)
    }

    function initBGLayer() {
        dungeon = new Sprite(imgs["dungeon.png"])
        const layer = new Container3d()
        camera.addChild(layer)

        floors = []

        for (let i = -3; i < 3; i++) {
            for (let j = -3; j < 5; j++) {
                const floor = new Sprite3d(dungeon.texture)
                floor.position.x = floor.texture.width * i
                floor.position.y = floor.texture.height * j
                floors.push(floor)
                layer.addChild(floor)
            }
        }
    }

    function initPlayerLayer() {
        const layer = new Container3d()
        camera.addChild(layer)
        player = new Sprite3d(new Sprite(imgs["explorer.png"]).texture)
        player.position.x = width / 2
        player.position.y = height / 2
        player.vx = 0
        player.vy = 0
        layer.addChild(player)

        camera.position3d.x = player.position.x
        camera.position3d.y = player.position.y
    }

    function initMonsterLayer() {
        let blob = new Sprite(imgs["blob.png"])
        const layer = new Container3d()
        camera.addChild(layer)
        monsters = []
        for (let i = 0; i < MONSTER_COUNT; i++) {
            let monster = new Sprite3d(blob.texture)
            monster.position.x = Math.random() * width * 3
            monster.position.y = Math.random() * height * 3
            monster.vx = Math.random() * 3 * tool.randomPosive()
            monster.vy = Math.random() * 3 * tool.randomPosive()
            monsters.push(monster)
            layer.addChild(monster)
        }
    }

    function initPanelLayer() {
        const layer = new Container3d()
        app.stage.addChild(layer)

        startMsg = new Text(countDownTime, new TextStyle({
            fontFamily: "Futura",
            fontSize: 64,
            fill: "white",
            align: "center"
        }))
        startMsg.x = width / 2
        startMsg.y = height / 2
        startMsg.visible = true
        layer.addChild(startMsg)

        overMsg = new Text("Game Over!", new TextStyle({
            fontFamily: "Futura",
            fontSize: 64,
            fill: "red",
            align: "center"
        }))
        overMsg.x = width / 3
        overMsg.y = height / 2
        overMsg.visible = false
        layer.addChild(overMsg)

        scoreMsg = new Text(0, new TextStyle({
            fontFamily: "Futura",
            fontSize: 24,
            fill: "white",
            align: "center"
        }))
        scoreMsg.x = width / 2
        scoreMsg.y = height / 2 - player.height
        scoreMsg.visible = false
        layer.addChild(scoreMsg)
    }

    function run() {
        app.ticker.add((delta) => {
            if (!loaded) {
                return
            }
            let current = new Date().getTime()
            countTime = parseInt((current - now) / 1000)
            startMsg.text = countDownTime - countTime
            scoreMsg.text = countTime - countDownTime
            if (current > now + countDownTime * 1000) {
                canStart = true
                startMsg.visible = false
                scoreMsg.visible = true
            }
            if (gameOver) {
                scoreMsg.visible = false
                overMsg.visible = true
                overMsg.text = 'You Alive ' + gameOverSecond + ' seconds\n press enter to restart'
            }
        })
        app.ticker.add((delta) => {
            if (window.innerWidth-1 != width) {
                width = (window.innerWidth > 0) ? window.innerWidth-1 : screen.width-1
                height = (window.innerHeight > 0) ? window.innerHeight-1 : screen.height-1
                initApp()
            }
            if (!loaded) {
                return
            }
            if (!canStart || gameOver) {
                return
            }
            player.x += player.vx
            player.y += player.vy
            camera.position3d.x = player.position.x
            camera.position3d.y = player.position.y
            // loop floor
            floors.forEach((floor) => {
                // player go right
                if (floor.position.x + floor.texture.width < player.position.x - floor.texture.width) {
                    floor.position.x += 6 * floor.texture.width
                }
                // player go left
                if (floor.position.x - floor.texture.width > player.position.x + floor.texture.width) {
                    floor.position.x -= 6 * floor.texture.width
                }
                // player go up
                if (floor.position.y + floor.texture.height < player.position.y - floor.texture.height) {
                    floor.position.y += 6 * floor.texture.height
                }
                // player go down
                if (floor.position.y - floor.texture.height > player.position.y + floor.texture.height) {
                    floor.position.y -= 6 * floor.texture.height
                }
            })
            // move monster
            monsters.forEach((monster) => {
                if (monster.position.x - monster.texture.width < player.position.x - dungeon.texture.width * 3) {
                    monster.position.y = player.position.y + Math.random() * height * tool.randomPosive()
                    monster.position.x = player.position.x + Math.random() * width + 2 * dungeon.texture.width
                }
                if (monster.position.x - monster.texture.width > player.position.x + dungeon.texture.width * 3) {
                    monster.position.y = player.position.y + Math.random() * height * tool.randomPosive()
                    monster.position.x = player.position.x - Math.random() * width - 2 * dungeon.texture.width
                }
                if (monster.position.y - monster.texture.height < player.position.y - dungeon.texture.height * 3) {
                    monster.position.x = player.position.x + Math.random() * width * tool.randomPosive()
                    monster.position.y = player.position.y + Math.random() * height + 2 * dungeon.texture.height
                }
                if (monster.position.y - monster.texture.height > player.position.y + dungeon.texture.height * 3) {
                    monster.position.x = player.position.x + Math.random() * width * tool.randomPosive()
                    monster.position.y = player.position.y - Math.random() * height - 2 * dungeon.texture.height
                }
                monster.x += monster.vx
                monster.y += monster.vy
                if (hitTestRectangle(player, monster)) {
                    let current = new Date().getTime()
                    gameOver = true
                    gameOverSecond = parseInt((current - now) / 1000) - countDownTime
                }
            })
        })
    }


    function hitTestRectangle(r1, r2) {
        let hit, combinedHalfWidths, combinedHalfHeights, vx, vy
        hit = false
        r1.centerX = r1.x + r1.width / 2
        r1.centerY = r1.y + r1.height / 2
        r2.centerX = r2.x + r2.width / 2
        r2.centerY = r2.y + r2.height / 2
        r1.halfWidth = r1.width / 2
        r1.halfHeight = r1.height / 2
        r2.halfWidth = r2.width / 2
        r2.halfHeight = r2.height / 2
        vx = r1.centerX - r2.centerX
        vy = r1.centerY - r2.centerY
        combinedHalfWidths = r1.halfWidth + r2.halfWidth
        combinedHalfHeights = r1.halfHeight + r2.halfHeight
        if (Math.abs(vx) < combinedHalfWidths) {
            if (Math.abs(vy) < combinedHalfHeights) {
                hit = true
            } else {
                hit = false
            }
        } else {
            hit = false
        }
        return hit
    }


    function initEvent() {

        let left = keyboard(65),
            up = keyboard(87),
            right = keyboard(68),
            down = keyboard(83),
            enter = keyboard(13)

        enter.press = function () {
            if (!canStart || gameOver) {
                initApp()
            }
        }

        //Left arrow key `press` method
        left.press = function () {
            //Change the player's velocity when the key is pressed
            player.vx = -5
            if (right.isDown) {
                player.vx = 0
            }
            // player.vy = 0
        }

        //Left arrow key `release` method
        left.release = function () {
            player.vx = 0
            if (right.isDown) {
                player.vx = 5
            }
        }

        //Up
        up.press = function () {
            player.vy = -5
            if (down.isDown) {
                player.vy = 0
            }
        }
        up.release = function () {
            player.vy = 0
            if (down.isDown) {
                player.vy = 5
            }
        }

        //Right
        right.press = function () {
            player.vx = 5
            if (left.isDown) {
                player.vx = 0
            }
        }
        right.release = function () {
            player.vx = 0
            if (left.isDown) {
                player.vx = -5
            }
        }

        //Down
        down.press = function () {
            player.vy = 5
            if (up.isDown) {
                player.vy = 0
            }
            // player.vx = 0
        }
        down.release = function () {
            player.vy = 0
            if (up.isDown) {
                player.vy = -5
            }
        }

        //The `keyboard` helper function
        function keyboard(keyCode) {
            var key = {}
            key.code = keyCode
            key.isDown = false
            key.isUp = true
            key.press = undefined
            key.release = undefined
            //The `downHandler`
            key.downHandler = function (event) {
                if (event.keyCode === key.code) {
                    if (key.isUp && key.press) key.press()
                    key.isDown = true
                    key.isUp = false
                }
                event.preventDefault()
            }

            //The `upHandler`
            key.upHandler = function (event) {
                if (event.keyCode === key.code) {
                    if (key.isDown && key.release) key.release()
                    key.isDown = false
                    key.isUp = true
                }
                event.preventDefault()
            }

            //Attach event listeners
            window.addEventListener(
                "keydown", key.downHandler.bind(key), false
            )
            window.addEventListener(
                "keyup", key.upHandler.bind(key), false
            )
            return key
        }
    }


    return {
        init: function (loaderInstance, res) {
            initApp()
            initEvent()
            run()
        }
    }
}(Tool)


UIController.init()