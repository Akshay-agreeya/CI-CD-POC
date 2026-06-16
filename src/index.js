const express = require("express");
const { add, subtract, multiply, divide, factorial, fibonacci } = require("./calculator");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/calculate", (req, res) => {
  const { operation, a, b } = req.body;

  try {
    let result;
    switch (operation) {
      case "add":
        result = add(a, b);
        break;
      case "subtract":
        result = subtract(a, b);
        break;
      case "multiply":
        result = multiply(a, b);
        break;
      case "divide":
        result = divide(a, b);
        break;
      case "factorial":
        result = factorial(a);
        break;
      case "fibonacci":
        result = fibonacci(a);
        break;
      default:
        return res.status(400).json({ error: `Unknown operation: ${operation}` });
    }
    res.json({ operation, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
