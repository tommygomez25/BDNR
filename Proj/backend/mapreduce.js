var async = require('async');
var assert = require('assert');
var logger = require('winston');
var Riak = require('basho-riak-client');

var nodes = [
    new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 })
];

var cluster = new Riak.Cluster({ nodes: nodes });

var client = new Riak.Client(cluster, function (err, c) {
    if (err) {
        throw new Error(err);
    }
    console.log('Connection to Riak established');

});


var mapReduceQuery = {
    inputs: { bucket: 'ccrosong9', key_filters: [['matches', '.*']] },
    query: [
        {
            map: {
                language: 'erlang',
                source: `
                    fun(RiakObject, _KeyData, _Arg) ->
                        {struct, Map} = mochijson2:decode(riak_object:get_value(RiakObject)),
                        NumLikes = proplists:get_value(<<"numLikes">>, Map),
                        [NumLikes]
                    end.
                `
            },
        },
        {
            reduce: {
                language: 'erlang',
                source: `
                    fun(Values, _Arg) ->
                        Res = lists:sum(Values),
                        [Res]
                    end.
                `
            }
        }
    ]
};

mapReduceQuery = {
    inputs: { bucket: 'lellum7u', key_filters: [['matches', 'post*']] },
    query: [
        {
            map: {
                language: 'erlang',
                source: `
                    fun(RiakObject, _KeyData, _Arg) ->
                        {struct, Map} = mochijson2:decode(riak_object:get_value(RiakObject)),
                        NumLikes = proplists:get_value(<<"numLikes">>, Map),
                        [NumLikes]
                    end.
                `
            },
        },
        {
            reduce: {
                language: 'erlang',
                source: `
                    fun(Values, _Arg) ->
                        Res = lists:sum(Values),
                        [Res]
                    end.
                `
            }
        }
    ]
};

mapReduceQuery = {
    inputs: { bucket: 'Post','index':'timestamp_bin', 'start':'8480', 'end':'8500' },
    query: [
        {
            map: {
                language: 'erlang',
                module: 'riak_kv_mapreduce',
                function: 'map_object_value',
                keep: true
            },
        },
        // sort by popularityScore
        {   
            reduce: {
                language: 'erlang',
                source: `
                    fun(Values, _Arg) ->
                        lists:sort(fun(A, B) -> 
                            {struct, AMap} = mochijson2:decode(A),
                            {struct, BMap} = mochijson2:decode(B),
                            AScore = proplists:get_value(<<"popularityScore">>, AMap),
                            BScore = proplists:get_value(<<"popularityScore">>, BMap),
                            AScore > BScore
                        end, Values)
                    end.
                `
            }
        }
    ]
};




// Convertendo a consulta MapReduce em uma string
var mapReduceString = JSON.stringify(mapReduceQuery);

// curl mapred
var curl = require('curlrequest');
var curlCommand = `curl -XPOST http://localhost:8098/mapred --data '${mapReduceString}' -H "Content-Type: application/json"`;
console.log('curl command:', curlCommand);

// Executando a consulta MapReduce
curl.request({ url: 'http://localhost:8098/mapred', method: 'POST', data: mapReduceString, headers: { 'Content-Type': 'application/json' } }, function (err, data) {
    if (err) {
        throw new Error(err);
    }
    //console.log('MapReduce query result:', data);
    // parse json
    var result = JSON.parse(data);
    var index_0 = JSON.parse(result[0][0]);
    console.log('MapReduce query result:', index_0);
});
