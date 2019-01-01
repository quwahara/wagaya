<?php (require __DIR__ . '/../jj/JJ.php')([
    'structs' => [
        'object',
        'object_graph',
        'commands' => [
            'register' => ''
        ],
        'views' => [
            'typeSelectable' => false,
            'arrayOperatable' => false,
        ]
    ],
    'get' => function (\JJ\JJ $jj) {
        $jj->data['object']['type'] = 'variable';
        $jj->data['object_graph']['parent_id'] = $jj->getRequest('parent_id', 0);
        if (($id = $jj->getId()) > 0) {
            if ($object = $jj->dao('object')->attFindOneById($id)) {
                $jj->data['object'] = $object;
            }
        }
        $jj->data['views'] = new stdClass();

        ?>
<html>
<head>
    <link rel="stylesheet" type="text/css" href="js/lib/node_modules/normalize.css/normalize.css">
    <link rel="stylesheet" type="text/css" href="css/fontawesome-free-5.5.0-web/css/all.css">
    <link rel="stylesheet" type="text/css" href="css/global.css">
    <script src="js/lib/node_modules/axios/dist/axios.js"></script>
    <script src="js/brx/booq.js"></script>
    <script src="js/lib/global.js"></script>
    <?= '<style>' . $jj->css()->style . '</style>' ?>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Object</title>
</head>
<body>
    <div>
        <div class="belt">
            <h1>Object</h1>
        </div>

        <div class="belt bg-mono-09">
            <div><a href="home.php">Home</a><a href="object-list.php">List</a></div>
        </div>

        <div class="contents">
            <form method="post">
                <input type="hidden" name="parent_id">
                <input type="hidden" name="id">
                <div class="row type-select none">
                    <label for="type">Type</label>
                    <select name="type" disabled>
                        <option value="variable">Variable</option>
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="object">Object</option>
                        <option value="array">Array</option>
                    </select>
                </div>
                <div class="row type-label none">
                    <label>Type</label>
                    <span class="type"></span>
                    <input type="hidden" name="type" disabled>
                </div>
                <div class="row">
                    <label for="name">Name</label>
                    <input type="text" name="name">
                </div>
                <div class="row value">
                    <label for="value">Value</label>
                    <input type="text" name="value">
                </div>
                <div class="row array-operations none">
                    <div><a class="array-new-item" href="object.php?parent_id=:parent_id">New item</a></div>
                </div>
                <div class="row">
                    <div class="label"></div>
                    <button type="button" name="register">Register</button>
                </div>
            </form>
        </div>
        <div id="snackbar"></div>
    </div>
    <script>
    window.onload = function() {
        Global.snackbar("#snackbar");

        var booq;
        (booq = new Booq(<?= $jj->structsAsJSON() ?>))
        .commands
        .register.on("click", function (event) {

            Global.snackbar.close();
                booq.status = "";
                axios.post("object.php", booq.data)
                .then(function (response) {
                    console.log(response.data);
                    booq.data = response.data;
                    // booq.data.message = response.data.message;
                    // if ("" !== booq.data.message) {
                    //     Global.snackbar.messageDiv.classList.add("warning");
                    //     Global.snackbar.maximize();
                    // }
                })
                .catch(Global.catcher(booq));
        })
        .end

        .object
        .id.withValue()
        .id.link(".array-new-item").toHref("object.php?parent_id=:id")
        .type.withValue()
        .type.toText()
        .type.on("change", booq.update)
        .name.withValue()
        .value.withValue()
        .end

        .views.setUpdate(function (data) {
            data.typeSelectable = !booq.data.object.id;
            data.arrayOperatable = booq.data.object.id && booq.data.object.type === "array";
        })
        .typeSelectable.link(".type-select").antitogglesClass("none")
        .typeSelectable.link(".type-select select").antitogglesAttr("disabled", "")
        .typeSelectable.link(".type-label").togglesClass("none")
        .typeSelectable.link(".type-label input").togglesAttr("disabled", "")
        .arrayOperatable.link(".array-operations").antitogglesClass("none")
        .end
        // .setUpdate(function () {
        //     var views = this.views.data;
        //     views.typeSelectable = !this.data.id;
        //     views.arrayOperatable = !this.data.id;

        //     Booq.q(".array-operations").toggleClassByFlag("none",
        //         !(this.data.type === "array" && this.data.id !== ""));
                
        //     Booq.q(".value").toggleClassByFlag("hidden", this.data.type !== "variable");
        // })
        .setData(<?= $jj->dataAsJSON() ?>)
        .update()
        ;

    };
    </script>
</body>
</html>
<?php

},
'post application/json' => function (\JJ\JJ $jj) {

    $object = $jj->data['object'];
    $objectDao = $jj->dao('object');
    $doUpdateObject = false;

    if (array_key_exists('id', $object) && intval($object['id']) > 0) {
        $doUpdateObject = null !== $objectDao->attFindOneById($object['id']);
    }

    if ($doUpdateObject) {
        $objectDao->attUpdateById($object);
    } else {
        unset($object['id']);
        $jj->data['object'] = $objectDao->attFindOneById($objectDao->attInsert($object));
    }


    $objectGraph = $jj->data['object_graph'];
    $objectGraphDao = $jj->dao('object_graph');

    if (array_key_exists('parent_id', $objectGraph) && intval($objectGraph['parent_id']) > 0) {
        $objectGraph['child_id'] = $jj->data['object']['id'];
        $jj->data['object_graph'] = $objectGraphDao->attFindOneById([
            parent_id => $objectGraph['parent_id'],
            child_id => $objectGraph['child_id'],
        ]);
    }

    if ($jj->data['object_graph'] === null) {
        unset($objectGraph['id']);
        $jj->data['object_graph'] = $objectGraphDao->attFindOneById($objectGraphDao->attInsert($objectGraph));
    }

    $jj->data['status'] = 'OK';
}
]);
?>
