const { add, subtract, multiply, divide, factorial, fibonacci } = require("../src/calculator");

describe("Calculator - Basic Operations", () => {
  test("add: returns sum of two numbers", () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });

  test("subtract: returns difference of two numbers", () => {
    expect(subtract(5, 3)).toBe(2);
    expect(subtract(0, 5)).toBe(-5);
  });

  test("multiply: returns product of two numbers", () => {
    expect(multiply(3, 4)).toBe(12);
    expect(multiply(-2, 3)).toBe(-6);
    expect(multiply(0, 100)).toBe(0);
  });

  test("divide: returns quotient of two numbers", () => {
    expect(divide(10, 2)).toBe(5);
    expect(divide(7, 2)).toBe(3.5);
  });

  test("divide: throws error on division by zero", () => {
    expect(() => divide(5, 0)).toThrow("Division by zero");
  });
});

describe("Calculator - Advanced Operations", () => {
  test("factorial: computes factorial correctly", () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
    expect(factorial(5)).toBe(120);
    expect(factorial(10)).toBe(3628800);
  });

  test("factorial: throws on negative input", () => {
    expect(() => factorial(-1)).toThrow("negative");
  });

  test("fibonacci: computes fibonacci correctly", () => {
    expect(fibonacci(0)).toBe(0);
    expect(fibonacci(1)).toBe(1);
    expect(fibonacci(6)).toBe(8);
    expect(fibonacci(10)).toBe(55);
  });

  test("fibonacci: throws on negative input", () => {
    expect(() => fibonacci(-1)).toThrow("negative");
  });
});
