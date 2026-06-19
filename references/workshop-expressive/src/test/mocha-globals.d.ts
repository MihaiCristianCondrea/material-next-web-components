declare namespace Mocha {
  class Test {}
  class Context {}
  class Runnable {}
}

declare function suite(name: string, callback: () => void): void;
declare function test(name: string, callback: () => void | Promise<void>): void;
