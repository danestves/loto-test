import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import categoriesRouter from "./categories";
import transactionsRouter from "./transactions";

const app = new Hono();

app.use("*", cors());
app.use("*", logger());
app.use("*", prettyJSON());

app.get("/health", (c) => {
  return c.json({
    success: true,
    message: "API v1 is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.route("/categories", categoriesRouter);
app.route("/transactions", transactionsRouter);

app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: "Endpoint not found",
    },
    404
  );
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
        ...(err.cause ? { details: err.cause } : {}),
      },
      err.status
    );
  }

  console.error("Unexpected error:", err);

  return c.json(
    {
      success: false,
      message: "Internal server error",
    },
    500
  );
});

export default app;
