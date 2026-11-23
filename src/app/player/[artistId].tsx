import { router, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider } from "@shopify/restyle";
import { Ionicons } from "@expo/vector-icons";
import { artists } from "../../data";
import { useConcertTheme, useContentWidth } from "../../useConcertTheme";
import { Box, Text } from "../../theme";
import { Artwork, Touch } from "../../components/ConcertUI";
export default function PlayerScreen() {
  const params = useLocalSearchParams<{ artistId: string; track?: string }>();
  const artist = artists.find((a) => a.id === params.artistId);
  const contentWidth = useContentWidth();
  const theme = useConcertTheme(artist?.atmosphere ?? "electric");
  const parsed = Number(params.track ?? 0);
  const index =
    artist &&
    Number.isInteger(parsed) &&
    parsed >= 0 &&
    parsed < artist.setlist.length
      ? parsed
      : 0;
  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/");
  const skip = (step: number) => {
    if (artist)
      router.setParams({
        track: String(
          (index + step + artist.setlist.length) % artist.setlist.length,
        ),
      });
  };
  return (
    <ThemeProvider theme={theme}>
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <Box
          paddingHorizontal="m"
          paddingTop="l"
          paddingBottom="s"
          width="100%"
          maxWidth={Math.min(contentWidth, 680)}
          alignSelf="center"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Touch label="Close player" onPress={close}>
            <Box
              flexDirection="row"
              alignItems="center"
              gap="xs"
              paddingHorizontal="s"
              paddingVertical="s"
            >
              <Ionicons
                name="chevron-down"
                size={26}
                color={theme.colors.text}
              />
              <Text fontWeight="600">Close</Text>
            </Box>
          </Touch>
          <Text variant="label">SETLIST PREVIEW</Text>
        </Box>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          <Box
            padding="m"
            gap="l"
            width="100%"
            maxWidth={Math.min(contentWidth, 680)}
            alignSelf="center"
            flex={1}
          >
            {!artist ? (
              <Box gap="s">
                <Text variant="title">Song not found</Text>
                <Text color="muted">Return to a concert to choose a song.</Text>
              </Box>
            ) : (
              <>
                <Box flex={1} minHeight={12} />
                <Artwork artist={artist} />
                <Box gap="xs">
                  <Text variant="title" accessibilityLiveRegion="polite">
                    {artist.setlist[index]}
                  </Text>
                  <Text color="muted">{artist.name}</Text>
                </Box>
                <Box gap="xs">
                  <Box height={3} backgroundColor="border" borderRadius="pill">
                    <Box
                      width={6}
                      height={6}
                      marginTop="none"
                      borderRadius="pill"
                      backgroundColor="accent"
                    />
                  </Box>
                  <Box flexDirection="row" justifyContent="space-between">
                    <Text variant="caption">0:00</Text>
                    <Text variant="caption">—:—</Text>
                  </Box>
                </Box>
                <Box
                  flexDirection="row"
                  justifyContent="space-evenly"
                  alignItems="center"
                >
                  <Touch label="Previous song" onPress={() => skip(-1)}>
                    <Box padding="s">
                      <Ionicons
                        name="play-skip-back"
                        size={30}
                        color={theme.colors.text}
                      />
                    </Box>
                  </Touch>
                  <Box
                    accessible
                    accessibilityRole="button"
                    accessibilityState={{ disabled: true }}
                    accessibilityLabel="Play unavailable. This fictional song has no audio."
                    width={76}
                    height={76}
                    borderRadius="pill"
                    backgroundColor="elevated"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons
                      name="play"
                      size={32}
                      color={theme.colors.muted}
                    />
                  </Box>
                  <Touch label="Next song" onPress={() => skip(1)}>
                    <Box padding="s">
                      <Ionicons
                        name="play-skip-forward"
                        size={30}
                        color={theme.colors.text}
                      />
                    </Box>
                  </Touch>
                </Box>
                <Box alignItems="center" gap="xs">
                  <Text variant="caption">
                    Track {index + 1} of {artist.setlist.length}
                  </Text>
                  <Text color="muted" textAlign="center">
                    Audio isn’t available for these demo songs.
                  </Text>
                </Box>
                <Box flex={1} minHeight={12} />
              </>
            )}
          </Box>
        </ScrollView>
      </SafeAreaView>
    </ThemeProvider>
  );
}
