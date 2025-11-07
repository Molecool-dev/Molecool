import * as os from 'os';

/**
 * System Information API
 * Provides access to system metrics like CPU and memory usage
 * Used by widgets to display system monitoring information
 */

export interface CPUInfo {
  usage: number; // 0-100
  cores: number;
}

export interface MemoryInfo {
  total: number; // bytes
  used: number;  // bytes
  free: number;  // bytes
  usagePercent: number; // 0-100
}

export interface SystemInfo {
  cpu: CPUInfo;
  memory: MemoryInfo;
}

/**
 * SystemAPI class provides methods to query system information
 */
export class SystemAPI {
  private previousCPUInfo: { idle: number; total: number } | null = null;

  /**
   * Get current CPU usage percentage
   * Uses a delta calculation between two measurements for accuracy
   * @returns Promise<number> CPU usage percentage (0-100)
   */
  async getCPUUsage(): Promise<number> {
    const cpus = os.cpus();
    
    // Calculate total and idle time for all cores
    let idle = 0;
    let total = 0;
    
    for (const cpu of cpus) {
      // Sum up all CPU times
      for (const type in cpu.times) {
        total += cpu.times[type as keyof typeof cpu.times];
      }
      // Idle time
      idle += cpu.times.idle;
    }
    
    // If this is the first call, store the values and return 0
    if (!this.previousCPUInfo) {
      this.previousCPUInfo = { idle, total };
      // Wait a short time to get a meaningful measurement
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getCPUUsage();
    }
    
    // Calculate the difference from the previous measurement
    const idleDelta = idle - this.previousCPUInfo.idle;
    const totalDelta = total - this.previousCPUInfo.total;
    
    // Store current values for next calculation
    this.previousCPUInfo = { idle, total };
    
    // Prevent division by zero
    if (totalDelta === 0) {
      return 0;
    }
    
    // Calculate usage percentage
    const usage = 100 - (100 * idleDelta / totalDelta);
    
    // Ensure the result is between 0 and 100
    return Math.max(0, Math.min(100, usage));
  }

  /**
   * Get memory information
   * @returns MemoryInfo object with memory statistics
   */
  getMemoryInfo(): MemoryInfo {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usagePercent = (usedMemory / totalMemory) * 100;
    
    return {
      total: totalMemory,
      used: usedMemory,
      free: freeMemory,
      usagePercent: Math.round(usagePercent * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Get complete system information including CPU and memory
   * @returns Promise<SystemInfo> Complete system information
   */
  async getSystemInfo(): Promise<SystemInfo> {
    const cpuUsage = await this.getCPUUsage();
    const memoryInfo = this.getMemoryInfo();
    
    return {
      cpu: {
        usage: Math.round(cpuUsage * 100) / 100, // Round to 2 decimal places
        cores: os.cpus().length
      },
      memory: memoryInfo
    };
  }

  /**
   * Reset CPU measurement state
   * Useful for testing or when you want to start fresh measurements
   */
  resetCPUMeasurement(): void {
    this.previousCPUInfo = null;
  }
}
