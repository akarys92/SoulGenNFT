import axios from "axios";

export class DalleConnector {
    private bearerToken: string; 
    private url: string; 
    constructor() {
        this.url = "https://labs.openai.com/api/labs";
        this.bearerToken = process.env.DALLE_TOKEN; 
    }

    // Create a dalle image
    async generateImage(seed: string) {
        return this._generate(seed); 
    }

    // private 
    async _generate(prompt) {
        let task: any= await axios.post(`${this.url}/tasks`, {
          json: {
            task_type: "text2im",
            prompt: {
              caption: prompt,
              batch_size: 4,
            },
          },
          headers: {
            Authorization: `Bearer ${ this.bearerToken }`
          }
        });
    
        return await new Promise((resolve, reject) => {
          const refreshIntervalId = setInterval(async () => {
            task = await this._getTask(task.id)
    
            switch (task.status) {
              case "succeeded":
                clearInterval(refreshIntervalId);
                return resolve(task.generations);
              case "rejected":
                clearInterval(refreshIntervalId);
                return reject(new DalleError(task.status_information));
              case "pending":
            }
          }, 2000);
        })
    }

    async _getTask(taskId) {
        return await axios.get(`${this.url}/tasks/${ taskId }`, {
          headers: {
            Authorization: "Bearer " + this.bearerToken,
          },
        });
    }
}

export class DalleError extends Error {
    public response: string; 
    constructor(response) {
      super();
      this.response = response;
    }
}

