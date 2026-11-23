import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProvider } from "@shopify/restyle";
import { router } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { artists, concerts, type Artist, type Concert } from "../data";
import { useSavedConcerts } from "../state/SavedConcerts";
import { Box, Card, Text } from "../theme";
import { useConcertTheme, useContentWidth } from "../useConcertTheme";
import { Artwork, Touch } from "./ConcertUI";
import { SaveConcertButton } from "./SaveConcertButton";

function FeaturedConcert({ artist, concert }: { artist: Artist; concert: Concert }) {
  const theme = useConcertTheme(artist.atmosphere);
  const openingAct = artists.find(
    (act) => act.id !== artist.id && concert.lineup.includes(act.id),
  );
  return (
    <Box gap="l" accessibilityLiveRegion="polite">
      <Card variant="standard" gap="m">
        <Artwork artist={artist} />
        <Box gap="xs">
          <Text variant="label">{artist.genre.toUpperCase()}</Text>
          <Text variant="hero">{artist.name}</Text>
          <Text variant="body">{artist.description}</Text>
        </Box>
        <Box gap="xs">
          <Text variant="heading">{concert.title}</Text>
          <Text>{concert.date}</Text>
          <Text color="muted">{concert.venue} · {concert.city}</Text>
          <Text variant="caption">Doors {concert.doors} · Headliner {artist.time}</Text>
        </Box>
        <SaveConcertButton artist={artist} />
      </Card>
      <Card variant="standard" gap="s">
        <Text variant="heading">Setlist preview</Text>
        <Text variant="caption">Expected songs and order may change.</Text>
        {artist.setlist.map((song, index) => (
          <Touch
            key={song}
            label={`Open ${song} in player preview`}
            onPress={() =>
              router.push({
                pathname: "/player/[artistId]",
                params: { artistId: artist.id, track: String(index) },
              })
            }
          >
            <Box flexDirection="row" alignItems="center" gap="s">
              <Text color="accent" width={28}>{String(index + 1).padStart(2, "0")}</Text>
              <Text flex={1}>{song}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
            </Box>
          </Touch>
        ))}
      </Card>
      {openingAct && (
        <Card variant="standard" gap="xs">
          <Text variant="label">ALSO ON THE LINEUP</Text>
          <Text variant="heading">{openingAct.name}</Text>
          <Text color="muted">{openingAct.genre} · {openingAct.time}</Text>
        </Card>
      )}
    </Box>
  );
}

function ConcertSelector({
  artist,
  concert,
  active,
  onSelect,
}: {
  artist: Artist;
  concert: Concert;
  active: boolean;
  onSelect: () => void;
}) {
  const artistTheme = useConcertTheme(artist.atmosphere);
  return (
    <Box width={210}>
      <Touch
        label={`Show ${artist.name}, ${concert.shortDate}`}
        checked={active}
        onPress={onSelect}
      >
        <Card
          variant={active ? "accent" : "standard"}
          minHeight={136}
          justifyContent="space-between"
          gap="s"
          borderWidth={2}
          style={{ borderColor: artistTheme.colors.accent }}
        >
          <Text
            variant="caption"
            style={{ color: active ? artistTheme.colors.onAccent : artistTheme.colors.accent }}
          >
            {concert.shortDate}
          </Text>
          <Text variant="heading" color={active ? "onAccent" : "text"}>
            {artist.name}
          </Text>
          <Text variant="caption" color={active ? "onAccent" : "muted"}>
            {concert.venue} {active ? "· Selected" : ""}
          </Text>
        </Card>
      </Touch>
    </Box>
  );
}

export default function ConcertList({ savedOnly = false }: { savedOnly?: boolean }) {
  const saved = useSavedConcerts();
  const [selectedId, setSelectedId] = useState(concerts[0].artistId);
  const shows = concerts.filter(
    (concert) => !savedOnly || saved.ids.includes(concert.artistId),
  );
  const selectedConcert = concerts.find((concert) => concert.artistId === selectedId)!;
  const selectedArtist = artists.find((artist) => artist.id === selectedId)!;
  const contentWidth = useContentWidth();
  const theme = useConcertTheme(savedOnly ? "electric" : selectedArtist.atmosphere);

  return (
    <ThemeProvider theme={theme}>
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
          <Box padding="m" gap="l" maxWidth={contentWidth} width="100%" alignSelf="center">
            <Box paddingTop="s" gap="m">
              <Text variant="caption" letterSpacing={3}>AFTERGLOW</Text>
              <Box gap="xs">
                <Text variant="hero">{savedOnly ? "Saved" : "Discover"}</Text>
                <Text color="muted">
                  {savedOnly
                    ? "The shows you don’t want to miss."
                    : "Choose a show to change the spotlight."}
                </Text>
              </Box>
            </Box>
            {!!saved.error && (
              <Text accessibilityRole="alert" color="muted">{saved.error}</Text>
            )}
            {savedOnly ? (
              <>
                {!shows.length && (
                  <Box gap="s" paddingVertical="l">
                    <Text variant="heading">
                      {saved.ready ? "Your next favourite is out there." : "Loading saved concerts…"}
                    </Text>
                    {saved.ready && (
                      <>
                        <Text color="muted">Bookmark a concert in Discover to keep it here.</Text>
                        <Touch label="Explore concerts" onPress={() => router.navigate("/")}>
                          <Text color="accent">Explore concerts →</Text>
                        </Touch>
                      </>
                    )}
                  </Box>
                )}
                {shows.map((concert) => {
                  const artist = artists.find((candidate) => candidate.id === concert.artistId)!;
                  return (
                    <Box key={artist.id} gap="xs">
                      <Touch
                        label={`${artist.name}, ${concert.date}. View concert and setlist`}
                        onPress={() =>
                          router.navigate({
                            pathname: "/concert/[id]",
                            params: { id: artist.id },
                          })
                        }
                      >
                        <Card variant="standard" gap="s">
                          <Artwork artist={artist} compact />
                          <Text variant="heading">{artist.name}</Text>
                          <Text variant="caption">{concert.shortDate} · {concert.venue}</Text>
                        </Card>
                      </Touch>
                      <SaveConcertButton artist={artist} />
                    </Box>
                  );
                })}
              </>
            ) : (
              <>
                <Box gap="s">
                  <Text variant="heading">Upcoming shows</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: theme.spacing.s, paddingBottom: 4 }}
                  >
                    {shows.map((concert) => {
                      const artist = artists.find((candidate) => candidate.id === concert.artistId)!;
                      const active = selectedId === artist.id;
                      return (
                        <ConcertSelector
                          key={artist.id}
                          artist={artist}
                          concert={concert}
                          active={active}
                          onSelect={() => setSelectedId(artist.id)}
                        />
                      );
                    })}
                  </ScrollView>
                </Box>
                <FeaturedConcert artist={selectedArtist} concert={selectedConcert} />
              </>
            )}
            <Text variant="caption">
              Three fictional shows. A little inspiration for your next night out.
            </Text>
          </Box>
        </ScrollView>
      </SafeAreaView>
    </ThemeProvider>
  );
}
