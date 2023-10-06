<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(\Vanillapod\Hyper\Container::class)]
final class ContainerTest extends TestCase
{
    public function testBasicUseCase()
    {
        $container = new \Vanillapod\Hyper\Container();
        $container->add('foo', function () {
            return "hello foo!";
        });
        $foo = $container->get('foo');
        $this->assertEquals($foo(), "hello foo!");
    }
    public function testErrorCase()
    {
        $container = new \Vanillapod\Hyper\Container();
        $container->add('foo', function () {
            return "hello foo!";
        });
        $this->expectException(\Vanillapod\Hyper\ContainerException::class);
        $container->add('foo', function () {
            return "hello foo!";
        });
    }
}
