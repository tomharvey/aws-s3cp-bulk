# AWS S3 Copy in Bulk

** Work in progress **

Copy each file, in a list of files, from one bucket to another.

Largely created out of need, but somewhat, to expore how to distribute workload
to new Lambda functions.

The main endpoint accepts a list of sources and destinations, this function will
asyncrounously send each source/destination pair to another  lambda function to
process that pair. The main function will wait for a response for each pair
and return the statuses of each.


## Quickstart
This function relies on [the Serverless framework](http://serverless.com) to
operate, so install that using: `npm install -g serverless`.

Then, deploy the function using `serverless deploy`

This will create a bucket in your AWS account with a name which follows the
format of `aws-s3cp-bulk-{AWS::Region}-{AWS::AccountId}`. Add a CSV file to that bucket
which contains the files which you want to copy, the CSV should have 2 columns

| source file path | destination file path |
| s3://bucket-name/file/path.ext | s3://another-bucket-name/file/path_new.ext |

It should **NOT** have a header row, the above is to show the format of the file
and an example.

Before you run the function, you will need to ensure that you grant the function
appropriate access to the source files and destination bucket. The function will
operate using a new role named along the lines of 
`aws-s3cp-bulk-production-{AWS::Region}-lambdaRole`
so add permissions to that role.

You can now invoke the function using `serverless invoke --function bulk-cp --date keyname_of.csv`

You will find the output of the results in the bucket.
