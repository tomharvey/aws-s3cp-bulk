# AWS S3 Copy in Bulk

**Work in progress**

Copy each file, in a list of files, from one bucket to another. Make use of AWS
Lambda to create many concurrent copy operations and increase speed of
operations. Use AWS S3 copy command to ensure lowest cost of operations.

Created out of a need to move ~10million obects.

The main endpoint accepts a list of sources and destinations, this function will
asyncrounously send each source/destination pair to another lambda function to
process that pair. The main function will wait for a response for each pair
and return the statuses of each.

## Quickstart
### Install
This function relies on [the Serverless framework](http://serverless.com) to
operate, so install that with: `npm install -g serverless`.

Then, deploy the functions to AWS Lambda with `serverless deploy`

### Prepare inputs
This will create an 'operational bucket' in your AWS account, which will be
used for the input files, reports and any tests with a name which follows the
format of `aws-s3cp-bulk-{AWS::Region}-{AWS::AccountId}`. Add a CSV file to
that bucket, containing a list of the files which you want to copy.
This CSV should have 2 columns:

| source file path | destination file path |
| --- | --- |
| s3://bucket-name/file/path.ext | s3://another-bucket-name/file/path_new.ext |

Your file should **NOT** have a header row, the above is to show the format of the file
and an example.


### File and Bucket Permissions
Before you run the function, you will need to ensure that you grant the function
appropriate access to the source files and destination bucket. The function will
operate using a new IAM role, named along the lines of 
`aws-s3cp-bulk-production-{AWS::Region}-lambdaRole`
so add permissions to that role which allow read from the source files and write
to the destination bucket.

### Run!
You can now invoke the function using
`serverless invoke --function bulk-cp --data list_of_files_to_copy.csv`

### Results
Results will be generated and written to your 'operational bucket' alongside
your input file using the naming scheme of
`./reports/input_name_report_YYYY-MM-DD.json`

Inside this file you will find a summary object and a detail list of each file
copy command result.

The summary will inform you of the total number of operations, the number of
successes and the number of failures.

The detail will report the source and destination file pair along with either
the ETag of the file on success, or the error message if an error occured.
