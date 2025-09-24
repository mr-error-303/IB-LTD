export default function handler(req, res) {
  res.status(200).json({
    message: "IB LTD API is working!",
    status: "success",
    version: "7.0.0",
    timestamp: new Date().toISOString()
  });
}