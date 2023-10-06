<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\CoversClass;
use Vanillapod\Hyper\Http\HttpMessage;

#[CoversClass(HttpMessage::class)]
final class HttpTest extends TestCase
{
    public function testBasicUseCase()
    {
        $message = new HttpMessage("1.1", ["X-Foo" => "hello"], "");
        $this->assertEquals($message->getProtocolVersion(), "1.1");
        $this->assertEquals($message->getHeaderLine("X-Foo"), "X-Foo:hello,");
    }
}
