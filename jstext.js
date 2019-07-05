/* ===================================================
 * js-text.js v0.01
 * https://github.com/rranauro/boxspringjs
 * ===================================================
 * Copyright 2013 Incite Advisors, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

// Porter stemmer in Javascript. Few comments, but it's easy to follow against
// the rules in the original paper, in
//
//  Porter, 1980, An algorithm for suffix stripping, Program, Vol. 14, no. 3,
//  pp 130-137,
//
// see also http://www.tartarus.org/~martin/PorterStemmer

// Release 1 be 'andargor', Jul 2004
// Release 2 (substantially revised) by Christopher McKenzie, Aug 2009
//
// CommonJS tweak by jedp

var _ = require('underscore')._
_.mixin(require('toolbelt'));

(function() {
  var step2list = {
      "ational" : "ate",
      "tional" : "tion",
      "enci" : "ence",
      "anci" : "ance",
      "izer" : "ize",
      "bli" : "ble",
      "alli" : "al",
      "entli" : "ent",
      "eli" : "e",
      "ousli" : "ous",
      "ization" : "ize",
      "ation" : "ate",
      "ator" : "ate",
      "alism" : "al",
      "iveness" : "ive",
      "fulness" : "ful",
      "ousness" : "ous",
      "aliti" : "al",
      "iviti" : "ive",
      "biliti" : "ble",
      "logi" : "log"
    };

  var step3list = {
      "icate" : "ic",
      "ative" : "",
      "alize" : "al",
      "iciti" : "ic",
      "ical" : "ic",
      "ful" : "",
      "ness" : ""
    };

  var c = "[^aeiou]";          // consonant
  var v = "[aeiouy]";          // vowel
  var C = c + "[^aeiouy]*";    // consonant sequence
  var V = v + "[aeiou]*";      // vowel sequence

  var mgr0 = "^(" + C + ")?" + V + C;               // [C]VC... is m>0
  var meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$";  // [C]VC[V] is m=1
  var mgr1 = "^(" + C + ")?" + V + C + V + C;       // [C]VCVC... is m>1
  var s_v = "^(" + C + ")?" + v;                   // vowel in stem

  function stemmer(w) {
    var stem;
    var suffix;
    var firstch;
    var re;
    var re2;
    var re3;
    var re4;
    var origword = w;

    if (w.length < 3) { return w; }

    firstch = w.substr(0,1);
    if (firstch == "y") {
      w = firstch.toUpperCase() + w.substr(1);
    }

    // Step 1a
    re = /^(.+?)(ss|i)es$/;
    re2 = /^(.+?)([^s])s$/;

    if (re.test(w)) { w = w.replace(re,"$1$2"); }
    else if (re2.test(w)) {  w = w.replace(re2,"$1$2"); }

    // Step 1b
    re = /^(.+?)eed$/;
    re2 = /^(.+?)(ed|ing)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      re = new RegExp(mgr0);
      if (re.test(fp[1])) {
        re = /.$/;
        w = w.replace(re,"");
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1];
      re2 = new RegExp(s_v);
      if (re2.test(stem)) {
        w = stem;
        re2 = /(at|bl|iz)$/;
        re3 = new RegExp("([^aeiouylsz])\\1$");
        re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
        if (re2.test(w)) { w = w + "e"; }
        else if (re3.test(w)) { re = /.$/; w = w.replace(re,""); }
        else if (re4.test(w)) { w = w + "e"; }
      }
    }

    // Step 1c
    re = /^(.+?)y$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(s_v);
      if (re.test(stem)) { w = stem + "i"; }
    }

    // Step 2
    re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step2list[suffix];
      }
    }

    // Step 3
    re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step3list[suffix];
      }
    }

    // Step 4
    re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
    re2 = /^(.+?)(s|t)(ion)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      if (re.test(stem)) {
        w = stem;
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1] + fp[2];
      re2 = new RegExp(mgr1);
      if (re2.test(stem)) {
        w = stem;
      }
    }

    // Step 5
    re = /^(.+?)e$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      re2 = new RegExp(meq1);
      re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
      if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
        w = stem;
      }
    }

    re = /ll$/;
    re2 = new RegExp(mgr1);
    if (re.test(w) && re2.test(w)) {
      re = /.$/;
      w = w.replace(re,"");
    }

    // and turn initial Y back to y

    if (firstch == "y") {
      w = firstch.toLowerCase() + w.substr(1);
    }

    return w;
  }

  // memoize at the module level
  var memo = {};
  var memoizingStemmer = function(w) {
    if (!memo[w]) {
      memo[w] = stemmer(w);
    }
    return memo[w];
  }

  if (typeof exports != 'undefined' && exports != null) {
    exports.stemmer = stemmer;
    exports.memoizingStemmer = memoizingStemmer;
  }

}());

var Hash = function(init) {
	var item
	, newItem;
	this._attributes = {};
	this._original = {};
	
	for (item in init) {
		if (init.hasOwnProperty(item)) {
			this._attributes[item] = this._original[item] = init[item];
		}
	}
	return this;		
};

Hash.prototype.get = function (name) {			
	return this._attributes && this._attributes[name];
};
Hash.prototype.lookup = Hash.prototype.get;
Hash.prototype.find = Hash.prototype.get;

Hash.prototype.contains = function (name) {
	return (typeof this.get(name) !== 'undefined');
};

Hash.prototype.attributes = function (v) {
	if (v) {
		this._attributes = v;
	}
	return this._attributes;
};
Hash.prototype.post = Hash.prototype.attributes;

Hash.prototype.getLength = function () {
	var k
	, count = 0;

	for (k in this._attributes) {
		if (this._attributes.hasOwnProperty(k)) {
			count += 1;				
		}
	}
	return count;
};

// What it does: Remove an item from the Hash
Hash.prototype.remove = function (name) {
	if (this._attributes[name]) {
		delete this._attributes[name];
	}
	return this;
};
// What it does: Return the Hash as an array so it can be used as an argument to map/reduce
Hash.prototype.each = function () {
	var objectArray = []
	, obj;

	for (obj in this._attributes) {
		if (this._attributes.hasOwnProperty(obj)) {
			objectArray.push([obj, this._attributes[obj]]);				
		}
	}
	return objectArray;
};

Hash.prototype.keys = function () {
	var keyArray = []
	, obj;

	for (obj in this._attributes) {
		if (this._attributes.hasOwnProperty(obj)) {
			keyArray.push(obj);				
		}
	}
	return keyArray;
};

Hash.prototype.first = function () {
	return(this.get(this.keys()[0]));		
};

// What it does: Bulk update the properties of the Hash
Hash.prototype.update = function (properties) {
	var property;
	
	for (property in properties) {
		if (properties.hasOwnProperty(property)) {
			this.set(property, properties[property]);
		}
	}
	return this;		
};

Hash.prototype.set = function (name, value) {
	var property;
	
	if (typeof name === 'object') {
		for (property in name) {
			if (name.hasOwnProperty(property)) {
				this.set(property, name[property]);
			}
		}			
	} else {
		this._attributes[name] = value;			
	}
	return this;
};
Hash.prototype.store = Hash.prototype.set;

// What it does: Returns an object containing only the selected items. args can be an Array of strings
// or separate argument strings
Hash.prototype.pick = function (args) {
	var i
	, list = []
	, target = {};
	
	// accepts arguments as either array of items to pick, or argument list of items
	if (typeof args === 'string') {
		// convert the arguments list to an array
		for (i=0; i < arguments.length; i += 1) {
			list.push(arguments[i]);
		}
	} else {
		// or, just use as is
		list = args;
	}
	// iterate over the arguments to pick up the items requested
	for (i=0; i < list.length; i += 1) {
		target[list[i]] = this.get(list[i]);
	}
	return target;
};

// What it does: Returns the object values to its original state
Hash.prototype.restore = function () {
	var item;
	
	for (item in this._attributes) {
		if (this._attributes.hasOwnProperty(item)) {
			this._attributes[item] = undefined;
		}
	}
	for (item in this._original) {
		if (this._original.hasOwnProperty(item)) {
			this._attributes[item] = this._original[item];
		}
	}
	return this;
};

Hash.prototype.empty = function () {
	return this.post({});
};

exports.Hash = Hash;
var stemmer = exports.stemmer

var JSTEXT = function() {
	var JSTEXT = {};
	
	// sums the elements of an array
	var sum = function (a) {

		if (a.length === 0) {
			return 0;
		}
		return (_.reduce(a, function(memo, num){ return memo + num; }, 0));
	};
	JSTEXT.sum = sum;

	var pow = function (x, pwr) {

		return Math.pow(x, pwr);
	};
	JSTEXT.pow = pow;

	var sumSq = function (vector) {			
		if (vector.length === 0) {
			return 0;
		}

		return ( sum(_.map(vector, function(item) {
			return pow(item, 2);
		})));
	};
	JSTEXT.sumSq = sumSq;

	var sqrt = function (x) {
		if (typeof x !== 'number') {
			throw 'error: argument or object of square root must be a number - ' + typeof x;
		}

		return Math.sqrt(x);
	};
	JSTEXT.sqrt = sqrt;

	var div = function (num, den) {			
		if (den === 0) {
			return 0;
		} 
		return (num / den);
	};
	JSTEXT.div = div;

	var log10 = function (val) {
		return Math.log(val) / Math.log(10);
	};
	JSTEXT.log10 = log10;

	var computeTfidf = function (count, words_in_doc, total_docs, docs_with_term) {
		var idf = function (num_docs, docs_with_term) { 
			try {
				return(1.0 + (log10(num_docs / docs_with_term)));
			}
			catch (e) {
				return 1.0;
			}
		};
		//console.log(count, words_in_doc, total_docs, docs_with_term, idf(total_docs, docs_with_term));			
		return((count / words_in_doc)*idf(total_docs, docs_with_term));	
	};
	JSTEXT.computeTfidf = computeTfidf;

	var dotProduct = function(v1, v2) {
		var intersection = _.intersection(_.keys(v1), _.keys(v2));

		return (_.reduce(_.map(intersection, 
		// map
		function(item) {
			return (v1[item] * v2[item]);
		}), 
		// reduce
		function(result, product) { 
			return result + product; 
		}, 0));
	};
	JSTEXT.dotProduct = dotProduct;

	// Purpose: Methods for scoring similarity of documents and clustering them.		
	var similarity = function () {
		var cluster = {};

		// setter/getter. returns and object { left: itemI, right: itemJ }
		var best = function () {
			var best_score, left, right, that = {}, intersects;

			var score = function (l, r, score, X) {
				if (l && r) {
					if (typeof best_score === 'undefined' || score > best_score) {
						best_score = score;
						left = l;
						right = r;
						intersects = X || {};
					}						
				}
				return {
					'left': left,
					'right': right,
					'score': best_score,
					'intersects': intersects
				};				
			};
			that.score = score;
			return that;
		};
		cluster.best = best;

		// v1, v2 are objects { 'word':tfidf, ...} { ... }
		var euclid = function (v1, v2) {				
			// Nothing to correlate
			if (_.isEmpty(v1)) {
				return 0;
			}
			var shared = _.intersects(v1, v2)
				,sumSq = 0;

			// calculate the square of the difference for each shared item	
			_.each(shared, function(item) {
				sumSq += pow((v1[item] - v2[item]), 2);
			});

			// return the square root of the sum.
			return sqrt(sumSq);
		};
		cluster.euclid = euclid;
		cluster.euclid.score = best().score;

		// v1, v2 are [] Arrays
		var pearson = function (vectors) {
			var v1 = vectors.v1
				,v2 = vectors.v2;

			// Nothing to correlate
			if (_.isEmpty(v1)) {
				return 0;
			}
			var	// Simple sums
				len = _.objectLength(v1)
				,sum1 = sum(v1)		
				,sum2 = sum(v2)
				// Sum of squares
				,sum1Sq	= sumSq(v1)		
				,sum2Sq = sumSq(v2)
				// Sum of products
				,pSum = sum(_.map(v1, function(item, i) {
					return (v2[i] ? item*v2[i] : 0);
				}))
				,num
				,score;

			// Calculate the Pearson score
			num = pSum - div((sum1*sum2), len);			
			score = sqrt((sum1Sq-div(pow(sum1,2), len)) * (sum2Sq-div(pow(sum2,2), len)));

			//console.log('num, score', num, score);						
			return (score === 0 ? 0 : div(num, score));
		};
		cluster.pearson = pearson;
		return cluster;
	};
	JSTEXT.similarity = similarity;


	// Web: http://norm.al/2009/04/14/list-of-english-stop-words/
	var stopwords = 'a,able,about,across,after,all,almost,also,am,among,an,and,any,are,as,at,be,because,been,but,by,can,cannot,could,dear,did,do,does,either,else,ever,every,for,from,get,got,had,has,have,he,her,hers,him,his,how,however,i,if,in,into,is,it,its,just,least,let,like,likely,may,me,might,most,must,my,neither,no,nor,not,of,off,often,on,only,or,other,our,own,rather,said,say,says,she,should,since,so,some,than,that,the,their,them,then,there,these,they,this,tis,to,too,twas,us,wants,was,we,were,what,when,where,which,while,who,whom,why,will,with,would,yet,you,your';

	var sentence = function (s) {
		var that = {}
		, sw = new Hash();

		// compile the stopwords into a hash
		stopwords.split(',').forEach(function( item ) {
			sw.store(item, 1);
		});

		// splits a string in to an array of keywords delimited by spaces;
		var tokenize = function (input) {
			return(input.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' '));
		};

		// Removes stop words from input and returns a new object with the stopwords removed.
		var stopWords = function (input) {
			var words = input;
			/*jslint unparam: true */
			words.forEach(function(word, index) {
				if (sw.contains(word)) {
					delete words[index];
				}				
			});
			return _.compact(words);
		};

		// removes words shorter than 'min' from consideration. 
		// also removes numbers-only by default
		// accepts Optional 'max' parameter to filter long words
		// example: { num: true, min: 3 }
		var applyfilter = function(f, input) {			
			var num = (f && f.num) || true
			, max = (f && f.max) || undefined
			, min = (f && f.min) || 1
			, words = input;

			/*jslint unparam: true */
			words.forEach(function(word, index) {
				if (word.length < min || (max && word.length > max) ||
					(num === true && (word.replace(/[^a-z]+/g, '') === ''))) {
					delete words[index];
				}				
			});
			return _.compact(words);		
		};

		// Purpose: create DICTIONARY with stemmed words
		var stem = function (input) {
			var words = input
			, target = [];
			/*jslint unparam: true */
			words.forEach(function(word) {
				target.push(stemmer(word));				
			});
			return target;
		};
		that.stem = stem;

		var toHash = function (input) {
			var words = input
			, localHash = new Hash()
			, found;

			words.forEach(function(word) {
				found = localHash.lookup(word);
				if (found) {
					localHash.store(word, found+1);
				} else {
					localHash.store(word, 1);
				}
			});
			return localHash;
		};

		if (_.isString(s)) {
			return(toHash(stem(applyfilter({'min': 3, 'max': 25}, stopWords(tokenize(s))))));
		}
	};


	// Purpose: returns a DICTIONARY object with tokenized and stemmed words; provides a tfidf() method
	// for computing the selective value of a term in a document relative to a corpus.
	JSTEXT.text = function(s) {
		var that = {
			'str': s
		};

		that = _.extend(that, sentence(s || ''));

		// merges the dictionary from 'words' into 'target' and keeps a count of the
		// number of the occurrences of a word
		var merge = function (sources) {
			var target = sentence('corpus')
				, found
				, id;

			// for each document already stopped and stemmed
			_.each(sources, function(doc) {
				// now for each word, merge the hashes
				_.each(doc.attributes(), function(value, word) {
					if (target.contains(word)) {
						target.set(word, target.get(word) + value);
					} else {
						target.set(word, doc.get(word));						
					}
				});						
			});
			return target;
		};
		that.merge = merge;

		var occurs = function (docs) {
			var target = new Hash();

			_.each(docs, function(s) {
				_.each(s.attributes(), function(count, word) {
					if (target.contains(word)) {
						target.set(word, target.get(word)+1);
					} else {
						target.set(word, 1);
					}
				});
			});
			return target;
		};
		that.occurs = occurs;

		var stats = function (doc) {
			var count = 0
				, uniq = 0;

			_.each(doc.attributes(), function(item) {
				count += item;
				uniq += 1;
			});

			return ({
				wordCount: count,
				uniqWords: uniq,
			});
		};
		that.stats = stats;

		// calculates tfidf for a document relative to a corpus 
		var frequencies = function (doc, corpusCounts, docOccurrences) {
			var target = new Hash()
			, id;

			// Purpose: compute the term-frequency, inverse document (tfidf) frequency for a
			// 'word' in a document relative to a 'corpus'
			// var tfidf = function (count, words_in_doc, total_docs, docs_with_term) {	
			_.each(doc.attributes(), function(count, word) {

				target.set(word, computeTfidf(count, stats(doc).wordCount, 
													corpusCounts.getLength(), docOccurrences.get(word)));
			});
			return target;
		};
		that.frequencies = frequencies;

		// returns a list of the best hits to a query
		var bestHits = function (query, list) {
			var result = [];

			// for each document in the list
			list.forEach(function(doc) {
				// get the intersection of its word vector with the query
				result.push(dotProduct(doc.post(), query.post(), function(x) {
					return x;
				}));
			});	
			return result;					
		};
		that.bestHits = bestHits;
		return that;
	};


	JSTEXT.process = function(doclist) {
		var corpus = {}
		, text = JSTEXT.text()
		, doclistCopy = _.clone(doclist);

		// convert sentences into a hash with word counts within the document
		corpus.doclist = _.map(_.clone(doclist), function(s, id) {
			return JSTEXT.text(s)
		});

		// create a hash to calculate the number of documents each word appears in
		corpus.occurrences = text.occurs(corpus.doclist);

		// merge the sentences into a corpus with the total word counts across all docs
		corpus.counts = text.merge(corpus.doclist);

		// using the corpus as a reference, calculate tfidf hash for each document
		corpus.tfidf = _.map(corpus.doclist, function (doc, index) {	
			return (text.frequencies(doc, corpus.counts, corpus.occurrences));
		});
				
		corpus.sentences = function(index) {
			return ((typeof index === 'number') && doclistCopy[index]) || docListCopy;
		};
		
		corpus.search = function (str) {
			var sources = _.map(corpus.doclist, function(v, index) { return index; })
			, results = text.bestHits(JSTEXT.text(str), corpus.tfidf);

			// returns bestHits by descending score;
			doclist = _.map(_.sortBy(_.zip(sources, results), function(result) {
				return result[1] * -1;
			}), _.identity);
			
			return doclist;
		};

		corpus.sort = function (sortedList) {
			sortedList = sortedList || doclist;
			
			var indices = _.map(sortedList, function(x) { return x[0] });

			return _.map(indices, function(value, index) {
				return doclist[sortedList[index][0]];
			});
		};

		return corpus;
	};
	return JSTEXT;
};

module.exports.JSTEXT = JSTEXT();

var split = function(w, len) {
	var i, result = [];

	// adjust len to be not gt than the incoming word length.
	len = len < w.length ? len : w.length;

	// remove non-alphas; lower case everything;
	w = w.replace(/[^a-z0-9 ]/gi,'').toLowerCase();
	for (i = 0; i < w.length-(len-1); i += 1) {
		result.push(w.slice(i, i+len));
	}
	return result;
};

var subStringMatcher = function(strs) {
	return function findMatches(query) {
		// regex used to determine if a string contains the substring `query`
		var substrRegex = new RegExp(query, 'i');

		// iterate through the pool of strings and for any string that
		// contains the substring `query`, add it to the `matches` array
		return _.reduce(strs, function(matches, str) {
			if (substrRegex.test(str)) {

				// the typeahead jQuery plugin expects suggestions to a
				// JavaScript object, refer to typeahead docs for more info
				matches.push(str);
			}
			return matches;
		}, []);
	};
};

module.exports.subStringMatcher = subStringMatcher;
module.exports.stopwords = require('./stopwords').stopwords;

