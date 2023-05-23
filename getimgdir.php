<?php

if(isset($_POST["subdir"])) {
    echo scandir("./img/textures/" . $_POST["subdir"]);
}
else echo "fuck you";

?>