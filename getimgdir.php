<?php

if(isset($_POST["subdir"])) {
    $dir = scandir("./img/" . $_POST["subdir"]);
    $string = "";

    foreach($dir as &$file) {
        $string .= $file . ":";
    }

    echo $string;
}
else echo "fuck you";

?>