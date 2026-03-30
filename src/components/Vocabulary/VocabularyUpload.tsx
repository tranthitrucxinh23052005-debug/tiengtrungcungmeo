import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Plus } from 'lucide-react';

interface VocabularyUploadProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function VocabularyUpload({ onSuccess, onCancel }: VocabularyUploadProps) {
  const [formData, setFormData] = useState({
    hanzi: '',
    pinyin: '',
    meaning_vi: '',
    example_sentence: '',
    example_pinyin: '',
    chunk: '',
    chunk_pinyin: '',
    hsk_level: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('vocabulary').insert([formData]);

      if (insertError) throw insertError;

      setFormData({
        hanzi: '',
        pinyin: '',
        meaning_vi: '',
        example_sentence: '',
        example_pinyin: '',
        chunk: '',
        chunk_pinyin: '',
        hsk_level: 1,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add vocabulary');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Add New Vocabulary</h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chinese Characters (Hanzi) *
            </label>
            <input
              type="text"
              value={formData.hanzi}
              onChange={(e) => setFormData({ ...formData, hanzi: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="你好"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pinyin *
            </label>
            <input
              type="text"
              value={formData.pinyin}
              onChange={(e) => setFormData({ ...formData, pinyin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="nǐ hǎo"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vietnamese Meaning *
          </label>
          <input
            type="text"
            value={formData.meaning_vi}
            onChange={(e) => setFormData({ ...formData, meaning_vi: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Xin chào"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Example Sentence *
          </label>
          <input
            type="text"
            value={formData.example_sentence}
            onChange={(e) => setFormData({ ...formData, example_sentence: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="你好，很高兴认识你"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Example Pinyin *
          </label>
          <input
            type="text"
            value={formData.example_pinyin}
            onChange={(e) => setFormData({ ...formData, example_pinyin: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="nǐ hǎo, hěn gāoxìng rènshi nǐ"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Common Phrase (Chunk)
          </label>
          <input
            type="text"
            value={formData.chunk}
            onChange={(e) => setFormData({ ...formData, chunk: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="你好吗？"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chunk Pinyin
          </label>
          <input
            type="text"
            value={formData.chunk_pinyin}
            onChange={(e) => setFormData({ ...formData, chunk_pinyin: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="nǐ hǎo ma?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HSK Level *
          </label>
          <select
            value={formData.hsk_level}
            onChange={(e) => setFormData({ ...formData, hsk_level: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <option key={level} value={level}>
                HSK {level}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Adding...' : 'Add Vocabulary'}
          </button>
        </div>
      </form>
    </div>
  );
}
