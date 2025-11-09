import { Playlist } from "../models/playlist.model.js";
import { Problem } from "../models/problem.model.js";

// Create a new playlist
export const createPlayList = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const playList = await Playlist.create({
      name,
      description,
      userId,
      problems: [],
    });

    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      playList,
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
};

// Get all playlists for the logged-in user
export const getPlayAllListDetails = async (req, res) => {
  try {
    const playLists = await Playlist.find({ userId: req.user.id }).populate("problems");

    res.status(200).json({
      success: true,
      message: "Playlists fetched successfully",
      playLists,
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
};

// Get details of a single playlist
export const getPlayListDetails = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const playList = await Playlist.findOne({
      _id: playlistId,
      userId: req.user.id,
    }).populate("problems");

    if (!playList) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playList,
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
};

// Add problems to a playlist
export const addProblemToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body; 

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemIds" });
    }

    const playList = await Playlist.findById(playlistId);
    if (!playList) return res.status(404).json({ error: "Playlist not found" });

    // Avoid duplicates
    const updatedProblems = [...new Set([...playList.problems, ...problemIds])];
    playList.problems = updatedProblems;
    await playList.save();

    res.status(200).json({
      success: true,
      message: "Problems added to playlist successfully",
      playList,
    });
  } catch (error) {
    console.error("Error adding problems to playlist:", error.message);
    res.status(500).json({ error: "Failed to add problems to playlist" });
  }
};

// Delete a playlist
export const deletePlayList = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
      deletedPlaylist,
    });
  } catch (error) {
    console.error("Error deleting playlist:", error.message);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
};

// Remove specific problems from a playlist
export const removeProblemFromPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemIds" });
    }

    const playList = await Playlist.findById(playlistId);
    if (!playList) return res.status(404).json({ error: "Playlist not found" });

    playList.problems = playList.problems.filter(
      (p) => !problemIds.includes(p.toString())
    );

    await playList.save();

    res.status(200).json({
      success: true,
      message: "Problems removed from playlist successfully",
      playList,
    });
  } catch (error) {
    console.error("Error removing problems from playlist:", error.message);
    res.status(500).json({ error: "Failed to remove problems from playlist" });
  }
};
