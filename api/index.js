export default function handler(req, res) {
  res.status(200).json({
    message: "IB LTD API is working!",
    status: "success",
    version: "11.0.0",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}