import net from 'net';

export async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = (server.address() as net.AddressInfo)?.port;
      server.close(() => {
        console.log(`✅ Port ${port} is available`);
        resolve(port);
      });
    });
    
    server.on('error', async (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${startPort} is busy, trying ${startPort + 1}...`);
        try {
          const nextPort = await findAvailablePort(startPort + 1);
          resolve(nextPort);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(err);
      }
    });
  });
}

export function setupGracefulShutdown(server: any) {
  const gracefulShutdown = (signal: string) => {
    console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
    
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.log('❌ Forcing server shutdown');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}