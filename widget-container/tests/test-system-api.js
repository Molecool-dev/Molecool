/**
 * Test script for System API
 * Run with: node test-system-api.js
 */

const { SystemAPI } = require('./dist/main/system-api');

async function testSystemAPI() {
  console.log('Testing System API...\n');
  
  const systemAPI = new SystemAPI();
  
  try {
    // Test CPU usage
    console.log('1. Testing CPU Usage:');
    const cpuUsage = await systemAPI.getCPUUsage();
    console.log(`   CPU Usage: ${cpuUsage.toFixed(2)}%`);
    console.log(`   ✓ CPU usage retrieved successfully\n`);
    
    // Test memory info
    console.log('2. Testing Memory Info:');
    const memoryInfo = systemAPI.getMemoryInfo();
    console.log(`   Total Memory: ${(memoryInfo.total / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   Used Memory: ${(memoryInfo.used / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   Free Memory: ${(memoryInfo.free / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   Usage: ${memoryInfo.usagePercent.toFixed(2)}%`);
    console.log(`   ✓ Memory info retrieved successfully\n`);
    
    // Test complete system info
    console.log('3. Testing Complete System Info:');
    const systemInfo = await systemAPI.getSystemInfo();
    console.log(`   CPU Cores: ${systemInfo.cpu.cores}`);
    console.log(`   CPU Usage: ${systemInfo.cpu.usage.toFixed(2)}%`);
    console.log(`   Memory Usage: ${systemInfo.memory.usagePercent.toFixed(2)}%`);
    console.log(`   ✓ Complete system info retrieved successfully\n`);
    
    // Test multiple CPU readings
    console.log('4. Testing Multiple CPU Readings:');
    for (let i = 0; i < 3; i++) {
      const usage = await systemAPI.getCPUUsage();
      console.log(`   Reading ${i + 1}: ${usage.toFixed(2)}%`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log(`   ✓ Multiple readings successful\n`);
    
    // Test reset
    console.log('5. Testing CPU Measurement Reset:');
    systemAPI.resetCPUMeasurement();
    const usageAfterReset = await systemAPI.getCPUUsage();
    console.log(`   CPU Usage after reset: ${usageAfterReset.toFixed(2)}%`);
    console.log(`   ✓ Reset successful\n`);
    
    console.log('✅ All System API tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testSystemAPI();
