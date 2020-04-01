module.exports = {
  devServer: {
    disableHostCheck: true,
    port: process.env.port || 3000,
    host: process.env.host || '0.0.0.0'
  }
}
