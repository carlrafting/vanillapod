<?php

declare(strict_types=1);

namespace Vanillapod\Hyper\Http;

class HttpMessage implements \Psr\Http\Message\MessageInterface
{
    static array $protocolVersions = ["1.0", "1.1"];
    public function __construct(private string $version = "1.1", private array $headers = [], private mixed $body = null)
    {
    }
    public function getProtocolVersion(): string
    {
        return $this->version;
    }

    public function withProtocolVersion(string $version): HttpMessage
    {
        return new self($version, $this->headers, $this->body);
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function hasHeader(string $name): bool
    {
        if (array_key_exists($name, $this->headers[$name])) {
            return true;
        }

        return false;
    }

    public function getHeader($name): array
    {
        if ($this->hasHeader($name)) {
            return $this->headers[$name];
        }

        return [];
    }

    public function getHeaderLine($name): string
    {
        if (!$this->hasHeader($name)) {
            return "";
        }

        if (is_array($this->getHeader($name))) {
            return join(",", $this->headers);
        }

        return $this->getHeader($name);
    }

    public function withHeader(string $protocolVersion, array|string $header): HttpMessage
    {
        return new self($protocolVersion, $header, $this->body);
    }

    public function getBody()
    {
    }
    public function withAddedHeader()
    {
    }
    public function withBody(\Psr\Http\Message\StreamInterface $streamInterface)
    {
    }
    public function withoutHeader()
    {
    }
}

class Request implements \Psr\Http\Message\RequestInterface
{
}

class Response implements \Psr\Http\Message\ResponseInterface
{
}
