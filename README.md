<p align="center">
  <a href="https://github.com/Forge-Panel" target="blank"><img src="https://raw.githubusercontent.com/Forge-Panel/.github/refs/heads/main/images/forge_logo_dark_bg.svg" width="512" alt="Forge Logo" /></a>
</p>
<h1 align="center">MailBurner</h1>

## Installation

MailBurner can only be installed using Docker.

1. Create a config file, click here for more documentation.
<br />

2. Deploy the following docker compose file
```yaml
services:
  ollama:
    image: ollama/ollama
    container_name: MailBurner_Ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
  
  redis:
    image: redis/redis-stack
    container_name: MailBurner_Redis
    ports:
      - 6379:6379
  
  mailburner:
    image: [NOT YET AVAILALBE]
    container_name: MailBurner_Worker
    depends_on:
      - redis
    
volumes:
  ollama-data:
```
<br />

3. Install & run Ollama model

You can view a list of models [here](https://ollama.com/search)
```shell
docker exec -it MailBurner_Ollama ollama pull <model>
docker exec -it MailBurner_Ollama ollama run <model>
```
<br />

4. Done!

Now you MailBurner will connect to your mailbox and process all the message inside the work folder.


## Development

1. Clone the project
```shell
git clone https://github.com/Forge-Panel/MailBurner-Worker.git
```
<br />

2. Install packages
```shell
npm install
```
<br />

3. Run necessary services
```shell
docker compose -f docker-compose.dev.yml up
```
<br />

4. Install & run Ollama model

You can view a list of models [here](https://ollama.com/search)
```shell
docker exec -it MailBurner_Ollama ollama pull <model>
docker exec -it MailBurner_Ollama ollama run <model>
```
<br />

5. Define your config.yaml

Recommended to use the filesystem driver to make it much easier to test locally.
```yaml
queue:
    host: 127.0.0.1
    port: 6379

mailboxes:
    - name: devtest
      connection:
          driver: filesystem
          path: './test'
      work_folder: AI_processing # Determine the folder the system should look in
      folders: # Describe the folders the system should know about
          - name: Invoices
            description: "All invoices should be inside this folder."
          - name: Trash
            description: "All spam and phising emails should be moved be here."
```
<br />

6. Run the project
```shell
npm run dev
```