<?php (require __DIR__ . '/../jj/JJ.php')([
    'models' => ['user'],
    'get' => function (\JJ\JJ $jj) {
        ?>
<html>
<head>
    <link rel="stylesheet" type="text/css" href="js/lib/node_modules/normalize.css/normalize.css">
    <link rel="stylesheet" type="text/css" href="css/fontawesome-free-5.5.0-web/css/all.css">
    <link rel="stylesheet" type="text/css" href="css/global.css">
    <script src="js/lib/node_modules/axios/dist/axios.js"></script>
    <script src="js/brx/brx.js"></script>
    <script src="js/lib/global.js"></script>
    <?= '<style>' . $jj->css()->style . '</style>' ?>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login</title>
</head>
<body>
    <div>
        <div class="belt">
            <h1>Login</h1>
        </div>

        <div class="belt bg-mono-09">
            <a href="menus.php">menus</a>
        </div>

        <div class="contents">
            <form name="theForm" method="post">
            <div class="row">
                <label for="name">Username</label>
                <input type="text" name="name" id="name" class="name">
            </div>
            <div class="row">
                <label for="password">Password</label>
                <input type="password" name="password" id="password" class="password">
            </div>
            <div class="row">
                <div class="label"></div>
                <button type="button" id="loginBtn">Login</button>
            </div>
            <?= $jj->xsrfHidden() ?>
            </form>
        </div>

    </div>
    <script>
    window.onload = function() {


        var data = <?= $jj->dataJSON ?>;

        var vs = Brx.validations;

        var b = new Brx({
            message: "",
            io: data["models"]
        });

// >>
        // b.io._showOn("status");
        // b.io._addClassOn("status", "un gray");
        // b.io._addClassOn("status", "un info");
// >>
        // b.io._addClassOn("status", "show");

        b.io.user._bind("name", {
            "validations": [vs.lengthMinMax({min: 1, max: 6})],
        });
        b.io.user._bind("password", {
            "validations": [vs.lengthMinMax({min: 1, max: 100})],
        });

        Brx.on("click", "#loginBtn", function (event) {
            Global.snackbar.close();
            b.io.status = "";
            axios.post("login.php", b.io)
            .then(function (response) {
                console.log(response.data);
                if (response.data.io.status === "#login-succeeded") {
                    window.location.href = window.location.href.replace("/login.php", "/home.php");
                }
                b.io = response.data.io;
            })
            .catch(Global.catcher(b.io));
        });

        Global.snackbar("#snackbar");
        b._toText("message");

        b.io._after("status", function (value) {
            b.message = Global.getMsg(value);
            if ("" === b.message) {

            } else {
                Global.snackbar.messageDiv.classList.add("warning");
                Global.snackbar.maximize();
            }
        });

    };
    </script>
    <div id="snackbar"></div>
</body>
</html>
<?php

},
'post application/json' => function (\JJ\JJ $jj) {
    // $jj->data['io'] = $jj->readJson();
    $user = $jj->dao('user')->attFindOneBy(['name' => $jj->data['io']['user']['name']]);
    if ($user && password_verify($jj->data['io']['user']['password'], $user['password'])) {
        $jj->data['io']['status'] = '#login-succeeded';
    } else {
        $jj->data['io']['status'] = '#login-failed';
    }
    $jj->responseJson();
}
]);
?>