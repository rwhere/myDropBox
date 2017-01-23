var express = require("express");
var AWS = require('aws-sdk');
var fs = require('fs')
var app = express();
var s3 = new AWS.S3();

var myBucket = 'cs499-waer';
var rootDir = '/home/ec2-user/DropBox';

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/list', function(req, res){
	var params = {
	  Bucket: myBucket
	};
	s3.listObjects(params, 	function(err, data){
	  for(var i = 0; i < data.Contents.length; i++) {
	  	data.Contents[i].Url = 'https://s3-us-west-1.amazonaws.com/' + data.Name + '/' + data.Contents[i].Key;
	  }
	  res.send(data.Contents);
	})
})


fs.watch(rootDir, (eventType, filename) => {
  if(eventType == 'rename')
  {
    if(!fs.existsSync(rootDir+"/"+filename))
    {
      console.log("file deleted: " + filename);
      fileDeleted(filename);
    }
    else
    {
      console.log("file created: " + filename);
      fileCreated(filename);
    }
  }
  else
  {
    console.log("file updated: " + filename);
    fileUpdated(filename);
  }
});

app.listen(9999, function() {
  console.log("Listening on port 9999...");
});

function fileDeleted(fileName)
{
  deleteFromS3(fileName);
}

function fileUpdated(fileName)
{
  uploadFileToS3(fileName);
}

function fileCreated(fileName)
{
  uploadFileToS3(fileName);
}

//delete an object from a bucket
function deleteFromS3(theKey) {
    var params = {
    Bucket: myBucket,
    Key: theKey
  };
  s3.deleteObject(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

//upload an object to a bucket
function uploadFileToS3(fileName) {
	fs.readFile(fileName, function (err, data) {
		params = {Bucket: myBucket, Key: fileName, Body: data, ACL: "public-read"};
	    s3.putObject(params, function(err, data) {
	         if (err) {
	             console.log(err)
	         } else {
	             console.log("Successfully uploaded data to " + myBucket, data);
	         }
	    });
	});
}
