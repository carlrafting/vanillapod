```php
<?php

declare(strict_types=1);

class Hello {
    constructor(
        public string $input
    ) {}
    say() {
        return "hello, $this->input!"
    }
}
```
