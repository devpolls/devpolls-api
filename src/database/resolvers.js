const _ = require('lodash')
const mongooseSchema = require('../db-service/database/mongooseSchema')

const { User, Article } = mongooseSchema
const { categories } = require('../config/category')
const getWeather = require('../weather')
const logger = require('../config/logger')
const { Tweet } = require('../db-service/database/mongooseSchema')
const SourceConfig = require('../config/news-source-config.json')

module.exports = {
	Query: {
		getArticles: async (parent, args, { Article }) => {
			args.criteria = args.criteria || {}
			args.criteria.lastQueryDate = args.criteria.lastQueryDate || new Date('2001-01-01')
			args.criteria.lastArticleId = args.criteria.lastArticleId || '000000000000000000000000'

			const promises = categories.map(async (category) => {
				const _articles = await Article.find({
					category,
					link: { $ne: null },
					modifiedDate: { $gt: new Date(args.criteria.lastQueryDate) },
					_id: { $gt: args.criteria.lastArticleId },
				})
					.lean()
					.sort({ _id: -1 })
					.limit(20)

				return [..._articles]
			})

			const articles = await Promise.all(promises)
			let articleFlattened = _.flatten(articles)
			articleFlattened = articleFlattened.sort((a, b) => (a._id < b._id ? 1 : b._id < a._id ? -1 : 0))
			const articleList = articleFlattened.map((article) => {
				const mySource = SourceConfig.find((x) => x.sourceName === article.sourceName)
				article.source = {
					_id: mySource.name,
					name: mySource.nepaliName,
					url: mySource.link,
					logoLink: process.env.SERVER_BASE_URL + mySource.logoLink,
				}
				return article
			})

			return articleList
		},

		getArticle: async (parent, { _id }) => {
			const article = await Article.findById(_id).lean()

			if (article == null) {
				logger.warn(`Article Id ${_id} not found in db`)
				return null
			}

			const source = SourceConfig.find((x) => x.sourceName === article.sourceName)
			return {
				...article,
				source: { name: source.nepaliName, url: source.link, logoLink: process.env.SERVER_BASE_URL + source.logoLink },
			}
		},

		getTweets: async (parent, args, { Tweet }) => {
			args.criteria = args.criteria || {}
			args.criteria.lastQueryDate = args.criteria.lastQueryDate || new Date('2001-01-01')
			args.criteria.lastTweetId = args.criteria.lastTweetId || '000000000000000000000000'

			const tweets = await Tweet.find().lean().sort({ publishedDate: -1 }).limit(100)
			const tweetsWithHandle = tweets.map((t) => {
				return { ...t, twitterHandle: { name: t.handle, handle: t.handle, _id: t._id } }
			})

			return tweetsWithHandle
		},

		getTweetByHandle: async (parent, { handle }) => {
			if (handle.charAt(0) !== '@') handle = '@' + handle
			const tweets = await Tweet.find({ handle }).sort({ publishedDate: -1 }).limit(100)
			return tweets
		},

		getLatestCoronaStats: async (parent, args, { CoronaStats }) => {
			const { CoronaDbService } = require('../db-service')
			return await CoronaDbService.getLatestStats()
		},

		getDistrictCoronaStats: async (parent, args, { DistrictCoronaStats }) => {
			const { DistrictCoronaDbService } = require('../db-service')
			return await DistrictCoronaDbService.getDistrictCoronaStats()
		},

		getTrending: async (parent, args, { TrendingTweetCount }) => {
			const { TrendingDbService } = require('./../db-service')
			return await TrendingDbService.getTrendingTweetCount()
		},

		getWeatherInfo: async (parent, args, { ipAddress }) => {
			try {
				if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') ipAddress = '27.111.16.0'
				logger.debug(`Printing ip: ${ipAddress}`)

				const weatherInfo = await getWeather(ipAddress)
				weatherInfo.ipAddress = ipAddress

				return {
					ipAddress: ipAddress,
					temperature: weatherInfo.main.temp,
					condition: weatherInfo.weather[0].main,
					description: weatherInfo.weather[0].description,
					place: weatherInfo.name,
				}
			} catch (error) {
				logger.error(`Error to getWeatherInfo for ip: ${ipAddress}`)
			}
		},
	},

	Mutation: {
		storeFcmToken: async (parent, args, { ipAddress }) => {
			const {
				input: { nid, fcmToken, countryCode, timeZone, createdDate, modifiedDate },
			} = args

			const response = await User.update(
				{ nid },
				{
					$set: {
						fcmToken,
						countryCode,
						timeZone,
						ipAddress,
						createdDate: createdDate || modifiedDate,
						modifiedDate: modifiedDate || createdDate,
					},
				},
				{ upsert: true },
			)

			return { success: !!response.ok }
		},
	},
}
