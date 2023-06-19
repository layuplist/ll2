# LL2

🚧

## Setup

1. Clone package: `git clone https://github.com/layuplist/ll2`
2. Install `yarn` if not already available: `npm install -g yarn`
3. (inside package) Install dependencies: `yarn install`
4. (inside package) Build packages: `yarn build`

Optional:

5. [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
6. [Install SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

_Note: All setup and development resources in this repository were written and tested using MacOS on Apple Silicon. Although everything should be compatible with MacOS on Intel, Windows, and most Linux distributions, they remain untested and procedures may differ slightly._

## Local Invocation

Most resources in this application can be locally simulated and invoked via the [AWS SAM CLI](https://aws.amazon.com/serverless/sam/). It is important to note that when a single resource is simulated locally, resulting requests/invocations external to that resource are likely _not_ simulated, and will run from your default AWS account.

To prime resource templates for local SAM invocation, run CDK synthesis for your entire workspace using `yarn synth` (this may take a few seconds, as it will build all packages in your workspace). Look for a log message that reads: `Successfully synthesized to /.../ll2/infra/cdk.out`, this is where your resource templates were generated.

Once resource templates are generated, you can use the SAM CLI to simulate and invoke various resources as needed. For example, to run the `spider-sync-handler` lambda function with an empty event (handy for priming a fresh ll2 deployment), run the following command:

```zsh
sam local invoke spider-sync-handler --no-event -t ./infra/cdk.out/api-stack.template.json
```

The first argument after "invoke" is the name of the function, in this case `spider-sync-lambda`. Then the `--no-event` flag is used to tell SAM not to pass an event, and the `-t` flag tells SAM where to find the resource template for the function.

It can be helpful when locally invoking functions to override some of its usual parameters. For instance, when priming a fresh ll2 deployment, the sync handler will likely need longer than 15 minutes to compile and publish all course updates to the database. The api-stack accepts a custom `Timeout` parameter to override that, and SAM will allow you to enter a timeout that is higher than 15 minutes (the max allowed on an actual lambda host).

```zsh
sam local invoke spider-sync-handler --no-event -t ./infra/cdk.out/api-stack.template.json --parameter-overrides ParameterKey=spidersynchandlertimeoutparameter,ParameterValue=3600
```

The above command will run for up to an hour (3600 seconds), plenty of time for the first sync operation. Another useful flag is `--profile`, which allows you to tell the SAM CLI which AWS CLI profile to use. For instance, I have several AWS accounts, and have aliased the LayupList AWS account as "layuplist", so I use `--profile layuplist` with SAM.
