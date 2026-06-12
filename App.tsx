import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import * as NavigationBar from 'expo-navigation-bar';

const shortSound = require('./assets/bruh.wav');
const longSound = require('./assets/bruh-long.wav');
const LONG_PRESS_MS = 1500;

const SURFACE = '#EBEBEB';
const BEZEL = '#161616';
const RED_TOP = '#E11D24';
const RED_BOTTOM = '#7A1417';

function prewarm(player: AudioPlayer): () => void {
  player.muted = true;
  player.play();
  const t = setTimeout(() => {
    player.pause();
    player.seekTo(0);
    player.muted = false;
  }, 200);
  return () => clearTimeout(t);
}

function restart(player: AudioPlayer) {
  player.pause();
  player.seekTo(0);
  player.play();
}

export default function App() {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width, height) * 0.78;
  const bezelThickness = size * 0.09;
  const domeSize = size - bezelThickness * 2;

  const shortPlayer = useAudioPlayer(shortSound);
  const longPlayer = useAudioPlayer(longSound);
  const longTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => prewarm(shortPlayer), [shortPlayer]);
  useEffect(() => prewarm(longPlayer), [longPlayer]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    NavigationBar.setBackgroundColorAsync('#000000');
    NavigationBar.setButtonStyleAsync('light');
  }, []);

  const cancelLongTimer = () => {
    if (longTimerRef.current) {
      clearTimeout(longTimerRef.current);
      longTimerRef.current = null;
    }
  };

  useEffect(() => cancelLongTimer, []);

  const onPressIn = () => {
    cancelLongTimer();
    longPlayer.pause();
    longPlayer.seekTo(0);
    restart(shortPlayer);
    longTimerRef.current = setTimeout(() => {
      longPlayer.play();
      longTimerRef.current = null;
    }, LONG_PRESS_MS);
  };

  const onPressOut = cancelLongTimer;

  return (
    <View style={styles.surface}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          styles.bezel,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        {({ pressed }) => (
          <View
            style={[
              styles.dome,
              {
                width: domeSize,
                height: domeSize,
                borderRadius: domeSize / 2,
              },
            ]}
          >
            <LinearGradient
              colors={[RED_TOP, RED_BOTTOM]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.75)',
                'rgba(255,255,255,0.25)',
                'rgba(255,255,255,0)',
              ]}
              locations={[0, 0.35, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[
                styles.shine,
                { height: '55%', opacity: pressed ? 0.3 : 1 },
              ]}
              pointerEvents="none"
            />
            <Text
              style={[
                styles.text,
                {
                  fontSize: domeSize * 0.18,
                  letterSpacing: domeSize * 0.005,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              BRUH
            </Text>
          </View>
        )}
      </Pressable>
      <StatusBar style="light" backgroundColor="#000000" />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bezel: {
    backgroundColor: BEZEL,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 16,
  },
  dome: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
