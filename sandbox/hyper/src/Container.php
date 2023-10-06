<?php

declare(strict_types=1);

namespace Vanillapod\Hyper;

class ContainerException extends \ErrorException implements \Psr\Container\ContainerExceptionInterface
{
}

class ContainerNotFound extends ContainerException implements \Psr\Container\NotFoundExceptionInterface
{
}

class Container implements \Psr\Container\ContainerInterface
{
    public function __construct(private array $containers = [])
    {
    }

    public function add(string $id, mixed $entry): mixed
    {
        if (!$this->has($id)) {
            return $this->containers[$id] = $entry;
        }

        throw new ContainerException("There is already a container registered with id: $id");
    }
    public function get(string $id): mixed
    {
        if ($this->has($id)) {
            return $this->containers[$id];
        }

        throw new ContainerNotFound("No container could be found with id: $id");
    }
    public function has(string $id): bool
    {
        if (array_key_exists($id, $this->containers)) {
            return true;
        }

        return false;
    }
}
