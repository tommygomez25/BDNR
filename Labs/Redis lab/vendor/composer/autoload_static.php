<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInitcdceac0567019c158213b81c56bac611
{
    public static $prefixLengthsPsr4 = array (
        'P' => 
        array (
            'Predis\\' => 7,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'Predis\\' => 
        array (
            0 => __DIR__ . '/..' . '/predis/predis/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInitcdceac0567019c158213b81c56bac611::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInitcdceac0567019c158213b81c56bac611::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInitcdceac0567019c158213b81c56bac611::$classMap;

        }, null, ClassLoader::class);
    }
}
