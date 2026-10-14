import type { NextFunction, Request, Response } from "express";
import { Counter, Histogram } from "prom-client";

const httpRequestsTotal = new Counter({
  help: "Total number of HTTP requests",
  labelNames: ["method", "handler", "status"],
  name: "http_requests_total",
});

const httpRequestDuration = new Histogram({
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "handler", "status"],
  name: "http_request_duration_seconds",
});

export default function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api/")) {
    return next();
  }
  const capturedPath = req.path;
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    const handler = capturedPath;
    const labels = { handler, method: req.method, status: String(res.statusCode) };
    httpRequestsTotal.inc(labels);
    end(labels);
  });
  next();
}
