# AWS S3 Copy in Bulk

**WORK IN PROGRESS** Outstanding work is tracked against the
[v1.0.0 milestone](https://github.com/tomharvey/aws-s3cp-bulk/milestone/1)

[![CircleCI](https://circleci.com/gh/tomharvey/aws-s3cp-bulk/tree/master.svg?style=svg)](https://circleci.com/gh/tomharvey/aws-s3cp-bulk/tree/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/d092876ca28a14529d8f/maintainability)](https://codeclimate.com/github/tomharvey/aws-s3cp-bulk/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d092876ca28a14529d8f/test_coverage)](https://codeclimate.com/github/tomharvey/aws-s3cp-bulk/test_coverage)

Copy each file, in a list of files, from one bucket to another. Make use of AWS
Lambda to create many concurrent copy operations and increase speed of
processing. Use AWS S3 copy command to ensure lowest cost of operations.

Created out of a need to move ~10million objects.

The main endpoint accepts a list of sources and destinations, this function will
asynchronously send each source/destination pair to another lambda function to
process that pair. Once each pair has been processed, the main function will
return the statuses of each operation and a summary of success/failures.

## Quickstart
### Install
This function relies on [the Serverless framework](http://serverless.com) to
operate, so install that with `npm install -g serverless`.

Then deploy these aws-s3cp-bulk functions to AWS Lambda with `serverless deploy`

### Prepare your inputs
The function expects a CSV which contains a list of source and destination files
for the copy command. How you create this list will depend on your specific
circumstances, but this file must be uploaded to S3 and made available to the
function. To do this, upload the file to your 'operational bucket'.

Deployment of the functions will create an 'operational bucket' in your AWS
account, which will be used for the input files and output reports. This bucket
is named using a format of `aws-s3cp-bulk-{AWS::Region}-{AWS::AccountId}`. Add a
CSV file to this bucket, containing a list of the files which you want to copy.
This CSV should have 2 columns:

| source file path | destination file path |
| --- | --- |
| s3://bucket-name/file/path.ext | s3://another-bucket-name/file/path_new.ext |

Your file should **NOT** have a header row, the above is to show the format of
the file and an example.


### File and Bucket Permissions
Before you run the function, you will need to ensure that you grant the function
appropriate access to the source files and destination bucket. The function will
operate using a new IAM role, named along the lines of 
`aws-s3cp-bulk-development-{AWS::Region}-lambdaRole`
Add permissions to that role to allow read from the source files and write to
the destination bucket.

### Run!
You can now invoke the function using

`serverless invoke --function bulk-cp --data {LIST_OF_FILES_TO_COPY.CSV}`

### Results
Results will be generated and written to your 'operational bucket' alongside
your input file using the naming scheme of
`./reports/{INPUT_NAME}_report_{YYYY-MM-DD}.json`

Inside this file you will find a summary object and a detailed list of each file
copy command's result.

The summary will inform you of the total number of operations, the number of
successes and the number of failures.

The detail will report the source/destination file pair, along with either
the ETag of the file on success, or the error message if an error occurred.


## Why the CSV input approach?
There is a need to feed the command with *large* amounts of data, around
10million files, each with a destination. This volume of data is too large
to otherwise feed into the command, and by outputting the results to a file,
we do not need to ensure rapid response time.

With smaller numbers of files, a JSON POST body may suffice, but there is
as yet no API Gateway to accept this kind of request-response mode of
operation. Feel free to contribute if you want to add this interface here.
