import historyProvider from './historyProvider'
import stream from './stream'
import { getTokenBySymbol } from "../../../data/Tokens";
import { DEFAULT_CHAIN_ID } from "../../../Helpers";



const supportedResolutions = [ "5", "15", "60", "240","1D"]

const config = {
    supported_resolutions: supportedResolutions
}; 

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	onReady: cb => {
	// console.log('=====onReady running')	
		setTimeout(() => cb(config), 0)
		
	},
	searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
		// console.log('====Search Symbols running')
	},
	resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
		// expects a symbolInfo object in response
		// console.log('======resolveSymbol running')
		var split_data = symbolName.split(/[:/]/)
		var symbol_stub = {
			name: symbolName,
			description: '',
			type: 'crypto',
			session: '24x7',
			timezone: 'Etc/UTC',
			ticker: symbolName,
			exchange: "",
			minmov: 1,
			pricescale: 100000000,
			has_intraday: true,
			has_daily:true,
			visible_plots_set:"ohlc",
			// intraday_multipliers: ['1', '60'],
			supported_resolution:  supportedResolutions,
			// volume_precision: 8,
			data_status: 'streaming',
		}

		const curToken = getTokenBySymbol(DEFAULT_CHAIN_ID, split_data[0]);

		symbol_stub.pricescale = Math.pow(10,curToken.displayDecimals)

		setTimeout(function() {
			onSymbolResolvedCallback(symbol_stub)
			// console.log('Resolving that symbol....', symbol_stub)
		}, 0)
		

	},
	getBars: function(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
		// console.log('=====getBars running')
		// console.log(`Requesting bars between ${new Date(periodParams.from * 1000).toISOString()} and ${new Date(periodParams.to * 1000).toISOString()}`)
		historyProvider.getBars(symbolInfo, resolution, periodParams)
		.then(bars => {
			if (bars.length) {
				onHistoryCallback(bars, {noData: false})
			} else {
				onHistoryCallback(bars, {noData: true})
			}
		}).catch(err => {
			console.log({err})
			onErrorCallback(err)
		})

	},
	subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
		// console.log('=====subscribeBars runnning')
		stream.subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback)
	},
	unsubscribeBars: subscriberUID => {
		// console.log('=====unsubscribeBars running')

		stream.unsubscribeBars(subscriberUID)
	},
	// calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
	// 	console.log('=====calculateHistoryDepth running')
	// 	return resolution < 60 ? {resolutionBack: 'D', intervalBack: '1'} : undefined
	// },
	getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
		// console.log('=====getMarks running')
	},
	getTimeScaleMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
		// console.log('=====getTimeScaleMarks running')
	},
	getServerTime: cb => {
		// console.log('=====getServerTime running')
	}
}
