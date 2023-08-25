import { postData, fetchData } from '../utils/fetch-util';

/**
 * Represents a path mapping model.
 */
class PathMappingModel {
  /**
   * @param {object} data - Data to initialize the path mapping model.
   * @param {string} data.source - The source path.
   * @param {string} data.destination - The destination path.
   * @param {string} [data.defaultValue] - The default value, if any.
   */
  constructor(data) {
    this.source = data.source;
    this.destination = data.destination;
    this.defaultValue = data.defaultValue || null;  // default to null if not provided
  }
}

/**
 * Represents metadata.
 */
class Metadata {
  /**
   * @param {object} data - Data to initialize metadata.
   * @param {string} data.version - The version.
   * @param {string} data.mimeType - The mime type.
   * @param {string} data.name - The name.
   * @param {Array} data.mapping - List of mapping.
   * @param {Array} data.outputMapping - List of output mapping.
   * @param {string} data.data - The data.
   * @param {string} [data.groupId] - Optional group ID.
   * @param {boolean} [data.isGrouped] - Optional isGrouped flag.
   * @param {string} [data.versionId] - Optional version ID.
   * @param {string} [data.containerId] - Optional container ID.
   */
  constructor(data) {
    this.version = data.version;
    this.mimeType = data.mimeType;
    this.name = data.name;
    this.mapping = data.mapping || [];  // default to an empty array if not provided
    this.outputMapping = data.outputMapping || [];  // same here
    this.data = data.data;
    this.groupId = data.groupId;
    this.isGrouped = data.isGrouped;
    this.versionId = data.versionId;
    this.containerId = data.containerId;
  }
}

/**
 * Represents an on-demand job.
 */
class OnDemandJob {
  constructor(data) {
    this.id = data.Id;
    this.createdDateUtc = new Date(data.CreatedDateUtc);
    this.lastUpdatedUtc = new Date(data.LastUpdatedUtc);
    this.name = data.Name;
    this.inputFileName = data.InputFileName;
    this.inputMime = data.InputMime;
    this.billedUsage = data.BilledUsage;
    this.recordCount = data.RecordCount;
    this.recordGroupCount = data.RecordGroupCount;
    this.processingTimeMS = data.ProcessingTimeMS;
    this.status = data.Status;
    this.errorMessage = data.ErrorMessage;
    this.versionNumber = data.VersionNumber;
  }
}

/**
 * Represents a container result with on-demand job data.
 */
class ContainerResult {
  constructor(data) {
    this.data = new OnDemandJob(data.Data);
    this.isError = data.IsError;
    this.errorMessage = data.ErrorMessage;
  }
}

/**
 * Represents a job.
 */
class Job {
  /**
   * @param {object} options - Options to initialize job.
   * @param {string} options.apiKey - The API key.
   * @param {string} options.productId - The product ID.
   * @param {Metadata} options.metadata - The metadata.
   * @param {File} options.file - The file.
   */
  constructor(options) {
    this.apiKey = options.apiKey;
    this.productId = options.productId;
    this.metadata = options.metadata;
    this.file = options.file;
  }

  /**
   * Submits the job and waits for the result.
   * @returns {Promise<ContainerResult>}
   */
  async submitWithoutPolling() {
    // Assuming the URL and headers are set elsewhere in the class
    const response = await postData(this.url, {
      method: 'POST',
      headers: this.headers,
      // ... other necessary request options ...
    });

    if (!response.ok) {
      throw new Error(`Failed to submit job: ${response.statusText}`);
    }

    const resultData = await response.json();
    return new ContainerResult(resultData);
  }

  /**
   * Submits the job and initiates polling to check the status.
   * @returns {Promise<ContainerResult>}
   */
  async submitWithPolling() {
    const initialResponse = await this.initiateJob();
    if (!initialResponse.ok) {
      throw new Error(`Failed to submit job: ${initialResponse.statusText}`);
    }

    const jobId = await initialResponse.json(); // assuming you get some ID or reference to the job

    return this.pollForResult(jobId);
  }

  async _initiateJob() {
    // const data = /* ... prepare your data ... */;
    return postData('/create-job', data, this.headers);
  }

  pollForResult(jobId) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${this.url}/${jobId}`);
          const data = await response.json();

          if (data.completed) { // or however you check job completion status
            clearInterval(interval);
            resolve(new ContainerResult(data));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 5000); // Poll every 5 seconds. Adjust this duration as necessary.
    });
  }

  // async getStatus(endpoint) {
  //   if (!this.id) {
  //     throw new Error('Job not submitted yet.');
  //   }

  //   const response = await fetchData(`${endpoint}/${this.id}/status`, {
  //     apiKey: this.apiKey,
  //   });

  //   if (response && response.status) {
  //     this.status = response.status;
  //     if (response.resultUri) {
  //       this.resultUri = response.resultUri;
  //     }
  //   }

  //   return this.status;
  // }

  async fetchResult() {
    if (!this.resultUri || this.status !== 'completed') {
      throw new Error('Result not available yet.');
    }

    const resultData = await fetchData(this.resultUri, {
      apiKey: this.apiKey,
    });

    return resultData;
  }

}

export default Job;
