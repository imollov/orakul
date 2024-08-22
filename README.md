# Blockchain Oracle

...

## Deploy to AWS

1. Create a new EC2 instance: Amazon Linux and t2.micro instance type.

2. In advance details, add the following user data:

```bash
#!/bin/bash

sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
```

3. Create a new key pair and allow SSH only.

4. Launch the instance.

5. Connect to the instance using SSH from the console or your terminal.

6. Switch to root user:

```bash
sudo su
```

7. Check docker version:

```bash
docker --version
```

8. Create `.env` file using the template from the repository. Use your preferred text editor, for example:

```bash
nano .env
```

9. Deploy the image from Docker Hub:

```bash
docker run --env-file .env imollov/blockchain-oracle
```

10. If everything is correct, you should see the following output:

```
🔗 Oracle contract...
👷🏼 Job registry...
🚀 Starting job client...
ℹ️ Listening for OracleRequest events...
```
