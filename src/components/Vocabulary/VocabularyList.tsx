import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { VocabularyUpload } from './VocabularyUpload';
import { Plus, Search, BookmarkPlus, BookmarkCheck, Play } from 'lucide-react';
import type { VocabularyWithProgress } from '../../types';

export function VocabularyList() {
  const { user } = useAuth();
  const [vocabulary, setVocabulary] = useState<VocabularyWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedWord, setSelectedWord] = useState<VocabularyWithProgress | null>(null);

  useEffect(() => {
    loadVocabulary();
  }, [user]);

  async function loadVocabulary() {
    try {
      const [vocabData, progressData, bookmarksData] = await Promise.all([
        supabase.from('vocabulary').select('*').order('created_at', { ascending: false }),
        supabase.from('vocabulary_progress').select('*').eq('user_id', user!.id),
        supabase.from('bookmarks').select('word_id').eq('user_id', user!.id),
      ]);

      const progressMap = new Map(
        (progressData.data || []).map((p) => [p.word_id, p])
      );

      const bookmarkSet = new Set((bookmarksData.data || []).map((b) => b.word_id));

      const enrichedVocab = (vocabData.data || []).map((v) => ({
        ...v,
        progress: progressMap.get(v.id),
        bookmarked: bookmarkSet.has(v.id),
      }));

      setVocabulary(enrichedVocab);
    } catch (error) {
      console.error('Error loading vocabulary:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startLearning(word: VocabularyWithProgress) {
    try {
      if (!word.progress) {
        await supabase.from('vocabulary_progress').insert({
          user_id: user!.id,
          word_id: word.id,
          level: 0,
          easiness_factor: 2.5,
          interval: 1,
          repetitions: 0,
          next_review_date: new Date().toISOString(),
          status: 'learning',
        });

        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await supabase
          .from('daily_stats')
          .select('*')
          .eq('user_id', user!.id)
          .eq('date', today)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('daily_stats')
            .update({ words_learned: existing.words_learned + 1 })
            .eq('id', existing.id);
        } else {
          await supabase.from('daily_stats').insert({
            user_id: user!.id,
            date: today,
            words_learned: 1,
          });
        }

        await loadVocabulary();
      }
    } catch (error) {
      console.error('Error starting learning:', error);
    }
  }

  async function toggleBookmark(word: VocabularyWithProgress) {
    try {
      if (word.bookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user!.id)
          .eq('word_id', word.id);
      } else {
        await supabase.from('bookmarks').insert({
          user_id: user!.id,
          word_id: word.id,
        });
      }
      await loadVocabulary();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  }

  const filteredVocabulary = vocabulary.filter(
    (v) =>
      v.hanzi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.meaning_vi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Vocabulary Library</h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Add Vocabulary
        </button>
      </div>

      {showUpload && (
        <VocabularyUpload
          onSuccess={() => {
            setShowUpload(false);
            loadVocabulary();
          }}
          onCancel={() => setShowUpload(false)}
        />
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search vocabulary..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="grid gap-4">
        {filteredVocabulary.map((word) => (
          <div
            key={word.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4">
                  <h3 className="text-3xl font-bold text-gray-800">{word.hanzi}</h3>
                  <span className="text-lg text-gray-600">{word.pinyin}</span>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                    HSK {word.hsk_level}
                  </span>
                  {word.progress && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        word.progress.status === 'mastered'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {word.progress.status}
                    </span>
                  )}
                </div>

                <p className="text-lg text-blue-600 font-medium">{word.meaning_vi}</p>

                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-800">{word.example_sentence}</p>
                  <p className="text-sm text-gray-600 mt-1">{word.example_pinyin}</p>
                </div>

                {word.chunk && (
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-sm text-blue-700 font-medium mb-1">Common Phrase:</p>
                    <p className="text-gray-800">{word.chunk}</p>
                    {word.chunk_pinyin && (
                      <p className="text-sm text-gray-600 mt-1">{word.chunk_pinyin}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => toggleBookmark(word)}
                  className={`p-2 rounded-lg transition ${
                    word.bookmarked
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {word.bookmarked ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <BookmarkPlus className="w-5 h-5" />
                  )}
                </button>

                {!word.progress && (
                  <button
                    onClick={() => startLearning(word)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Play className="w-4 h-4" />
                    Learn
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVocabulary.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No vocabulary found. Add some words to get started!</p>
        </div>
      )}
    </div>
  );
}
