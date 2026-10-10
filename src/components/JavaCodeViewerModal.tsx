import React, { useState } from 'react';
import {
  X,
  Code2,
  Copy,
  Check,
  FileCode,
  FolderTree,
  Database,
  Terminal,
  Layers,
  BookOpen,
  Download
} from 'lucide-react';
import { JAVA_PROJECT_FILES, JavaFileItem } from '../data/javaSourceFiles';

interface JavaCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const JavaCodeViewerModal: React.FC<JavaCodeViewerModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<JavaFileItem>(JAVA_PROJECT_FILES[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'files' | 'architecture' | 'mysql' | 'guide'>('files');

  if (!isOpen) return null;

  const categories = ['All', 'Configuration', 'Entities', 'Controllers', 'Services', 'Database'];
  const filteredFiles = activeCategory === 'All'
    ? JAVA_PROJECT_FILES
    : JAVA_PROJECT_FILES.filter(f => f.category === activeCategory);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    onShowToast(`Copied ${selectedFile.path} to clipboard`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-hidden">
      <div className="relative w-full max-w-6xl bg-[#1E1E1E] text-gray-200 rounded-3xl shadow-2xl border border-gray-800 overflow-hidden h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-[#181818] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-[#FF5A1F] flex items-center justify-center border border-orange-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white font-['Outfit']">
                  FoodHub – Java 17 + Spring Boot 3 + Maven Source
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Production Grade
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Generated Spring MVC REST APIs, JPA Hibernate entities, MySQL schemas, & Security
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="px-6 py-2 bg-[#252526] border-b border-gray-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('files')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                tab === 'files' ? 'bg-[#FF5A1F] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Source Code Files</span>
            </button>
            <button
              onClick={() => setTab('architecture')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                tab === 'architecture' ? 'bg-[#FF5A1F] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Package Architecture</span>
            </button>
            <button
              onClick={() => setTab('mysql')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                tab === 'mysql' ? 'bg-[#FF5A1F] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>MySQL 8.x DDL & Seeds</span>
            </button>
            <button
              onClick={() => setTab('guide')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                tab === 'guide' ? 'bg-[#FF5A1F] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Setup & Run Instructions</span>
            </button>
          </div>

          <span className="hidden sm:inline text-gray-500 font-mono text-[11px]">
            Maven Artifact: com.foodhub:foodhub-backend:1.0.0
          </span>
        </div>

        {/* Content Body */}
        {tab === 'files' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar with files */}
            <div className="w-72 bg-[#181818] border-r border-gray-800 flex flex-col flex-shrink-0">
              {/* Category Filter */}
              <div className="p-3 border-b border-gray-800">
                <div className="flex flex-wrap gap-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        activeCategory === cat
                          ? 'bg-[#FF5A1F] text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* File list */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredFiles.map(file => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                      selectedFile.path === file.path
                        ? 'bg-[#2A2D2E] text-amber-300 font-bold border-l-3 border-[#FF5A1F]'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                  >
                    <span className="truncate">{file.path}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded">
                      {file.language}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Code editor view */}
            <div className="flex-1 flex flex-col bg-[#1E1E1E] overflow-hidden">
              <div className="p-3 px-5 bg-[#252526] border-b border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-amber-300 font-bold">{selectedFile.path}</span>
                  <p className="text-[11px] text-gray-400">{selectedFile.description}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-auto p-5 font-mono text-xs text-gray-200 leading-relaxed bg-[#1E1E1E]">
                <pre>
                  <code>{selectedFile.content}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {tab === 'architecture' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-[#252526] p-6 rounded-2xl border border-gray-800">
              <h3 className="text-base font-bold text-white mb-2">Spring Boot Architectural Layers</h3>
              <p className="text-xs text-gray-400 mb-6">
                Organized following strict Enterprise Java patterns: Controller &rarr; Service &rarr; Repository &rarr; Entity &rarr; DTO.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#1E1E1E] rounded-xl border border-gray-800">
                  <h4 className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider mb-2">1. Controller Layer</h4>
                  <ul className="text-xs text-gray-300 space-y-1 font-mono">
                    <li>• AuthController</li>
                    <li>• RestaurantController</li>
                    <li>• FoodItemController</li>
                    <li>• CartController</li>
                    <li>• OrderController</li>
                    <li>• PaymentController</li>
                    <li>• UserController</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#1E1E1E] rounded-xl border border-gray-800">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">2. Service Layer</h4>
                  <ul className="text-xs text-gray-300 space-y-1 font-mono">
                    <li>• UserService</li>
                    <li>• RestaurantService</li>
                    <li>• FoodItemService</li>
                    <li>• CartService</li>
                    <li>• OrderService</li>
                    <li>• PaymentService</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#1E1E1E] rounded-xl border border-gray-800">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">3. Repository Layer</h4>
                  <ul className="text-xs text-gray-300 space-y-1 font-mono">
                    <li>• UserRepository</li>
                    <li>• RestaurantRepository</li>
                    <li>• FoodItemRepository</li>
                    <li>• CartRepository</li>
                    <li>• CartItemRepository</li>
                    <li>• OrderRepository</li>
                    <li>• PaymentRepository</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#1E1E1E] rounded-xl border border-gray-800">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">4. JPA Entities</h4>
                  <ul className="text-xs text-gray-300 space-y-1 font-mono">
                    <li>• User (Roles)</li>
                    <li>• Restaurant</li>
                    <li>• FoodItem</li>
                    <li>• Cart</li>
                    <li>• CartItem</li>
                    <li>• Order (6 Statuses)</li>
                    <li>• Payment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'mysql' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-[#252526] p-6 rounded-2xl border border-gray-800">
              <h3 className="text-base font-bold text-white mb-2">MySQL Relational Schemas & Foreign Keys</h3>
              <p className="text-xs text-gray-400 mb-4">
                Execute the following statements in MySQL 8.x Workbench or terminal:
              </p>
              <pre className="p-4 bg-[#1E1E1E] rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto">
{`CREATE DATABASE IF NOT EXISTS foodhub_db;
USE foodhub_db;

-- 8 Key Tables Created:
-- 1. users (id, name, email, password, phone, address, role, created_at)
-- 2. restaurants (id, name, description, address, phone, image_url, rating, delivery_time, is_active)
-- 3. food_items (id, restaurant_id, name, description, category, price, image_url, is_available)
-- 4. cart (id, user_id)
-- 5. cart_items (id, cart_id, food_item_id, quantity, price)
-- 6. orders (id, user_id, restaurant_id, total_amount, delivery_address, payment_method, payment_status, order_status, created_at)
-- 7. order_items (id, order_id, food_item_id, quantity, price)
-- 8. payments (id, order_id, amount, payment_method, payment_status, transaction_id, payment_date)`}
              </pre>
            </div>
          </div>
        )}

        {tab === 'guide' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-300">
            <div className="bg-[#252526] p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-base font-bold text-white">How to Run Spring Boot Locally</h3>

              <div>
                <h4 className="font-bold text-amber-300 mb-1">1. Prerequisites</h4>
                <p>• Java 17 or higher (`java -version`)</p>
                <p>• Apache Maven 3.8+ (`mvn -version`)</p>
                <p>• MySQL Server 8.x running on port 3306</p>
              </div>

              <div>
                <h4 className="font-bold text-amber-300 mb-1">2. Run with Maven</h4>
                <pre className="p-3 bg-[#1E1E1E] rounded-lg font-mono text-emerald-400">
cd foodhub-backend-java
mvn clean install
mvn spring-boot:run
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-amber-300 mb-1">3. Default Test Logins</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  <div className="p-2 bg-[#1E1E1E] rounded-lg">
                    <p className="font-bold text-white">Customer</p>
                    <p className="text-gray-400">john.doe@example.com</p>
                    <p className="text-gray-400">Password: Password123!</p>
                  </div>
                  <div className="p-2 bg-[#1E1E1E] rounded-lg">
                    <p className="font-bold text-white">Restaurant Owner</p>
                    <p className="text-gray-400">owner.goldenspoon@foodhub.com</p>
                    <p className="text-gray-400">Password: Owner123!</p>
                  </div>
                  <div className="p-2 bg-[#1E1E1E] rounded-lg">
                    <p className="font-bold text-white">Administrator</p>
                    <p className="text-gray-400">admin@foodhub.com</p>
                    <p className="text-gray-400">Password: Admin123!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
