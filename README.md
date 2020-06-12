## bitbucket pipeline deployment

branch: master
deployment: rf-dashboard-server-deploy

is currently the default deployment, has its own unique aws tag environment prefix:
ui-production

when deployed is successful, a docker container will be up at that tagged machine 
and the server will be listening on the given PORT

the deployment is dependent upon the env branch on supporotmate-envs:
dashboard-server-ui-production

where  the ui-production is the environment tag.
the dashboard-server is the suffix.

currently, all you need to do is just run that deployment.
temporarily, all parameters are pre set.