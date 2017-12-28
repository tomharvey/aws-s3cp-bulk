# AWS S3 Copy in Bulk

Copy each file, in a list of files, from one bucket to another.

Largely created out of need, but somewhat, to expore how to distribute workload to new Lambda functions.

The main endpoint accepts a list of sources and destinations, this function will asyncrounously send each source/destination pair to another  lambda function to process that pair. The main function will wait for a response for each pair and return the statuses of each.
