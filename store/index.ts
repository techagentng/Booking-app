import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Type for flagged booking entry
interface FlaggedBooking {
  fileName: string;
  guestName: string;
  timestamp: string;
}

// Sample flagged bookings data
const sampleFlaggedBookings: FlaggedBooking[] = [
  {
    fileName: 'john_doe_passport_obs.jpg',
    guestName: 'John Doe',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    fileName: 'sarah_williams_id_obs.png',
    guestName: 'Sarah Williams',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    fileName: 'michael_chen_drivers_obs.jpg',
    guestName: 'Michael Chen',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    fileName: 'emma_johnson_national_id_obs.pdf',
    guestName: 'Emma Johnson',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    fileName: 'david_okonkwo_passport_obs.jpg',
    guestName: 'David Okonkwo',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
];

// Score slice for tracking _obs file uploads
const scoreSlice = createSlice({
  name: 'score',
  initialState: {
    count: 5,
    flaggedFiles: sampleFlaggedBookings.map(b => b.fileName),
    flaggedBookings: sampleFlaggedBookings,
  },
  reducers: {
    incrementScore: (state, action: PayloadAction<{ fileName: string; guestName?: string }>) => {
      state.count += 1;
      // Support both old format (string) and new format (object)
      const fileName = typeof action.payload === 'string' ? action.payload : action.payload.fileName;
      const guestName = typeof action.payload === 'string' ? '' : (action.payload.guestName || '');
      
      state.flaggedFiles.push(fileName);
      state.flaggedBookings.push({
        fileName,
        guestName: guestName || 'Unknown Guest',
        timestamp: new Date().toISOString(),
      });
    },
    resetScore: (state) => {
      state.count = 0;
      state.flaggedFiles = [];
      state.flaggedBookings = [];
    },
  },
});

export const { incrementScore, resetScore } = scoreSlice.actions;

// Combine reducers
const rootReducer = combineReducers({
  score: scoreSlice.reducer,
});

// Persist config - changed key to reset persisted data with new sample data
const persistConfig = {
  key: 'hotel-app-v2',
  storage,
  whitelist: ['score'], // Only persist score slice
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
